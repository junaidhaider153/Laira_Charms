import { describe, it, expect, beforeEach } from "vitest";
import {
  getPaymentByOrderReference,
  submitPaymentProof,
  reviewPayment,
} from "./payment-service";
import { createOrder } from "@/lib/checkout/order-service";
import type { CreateOrderInput } from "@/lib/checkout/types";

describe("Payment Service & Verification State Machine", () => {
  let testOrderRef: string;
  let testGuestToken: string;

  beforeEach(async () => {
    const input: CreateOrderInput = {
      idempotencyKey: "payment-test-idemp-" + Math.random(),
      address: {
        fullName: "Hira Salman",
        email: "hira@example.com",
        phone: "03009876543",
        streetAddress: "House 10, Main Blvd",
        city: "Karachi",
        province: "Sindh",
        postalCode: "75500",
      },
      items: [
        {
          productId: "11111111-1111-1111-1111-111111111101",
          slug: "cherry-blossom-charm",
          title: "Cherry Blossom Bloom Charm",
          unitPriceMinor: 120000,
          quantity: 1,
        },
      ],
    };

    const res = await createOrder(input);
    testOrderRef = res.order.reference;
    testGuestToken = res.guestToken!;
  });

  it("retrieves initial payment record with 'awaiting_payment' status", async () => {
    const result = await getPaymentByOrderReference(testOrderRef, testGuestToken);
    expect(result).not.toBeNull();
    expect(result?.payment.status).toBe("awaiting_payment");
    expect(result?.order.reference).toBe(testOrderRef);
  });

  it("submitting proof transitions payment to 'verification_pending', NOT 'verified'", async () => {
    const submitResult = await submitPaymentProof({
      orderReference: testOrderRef,
      methodId: "meezan",
      senderName: "Hira Salman",
      transactionId: "TXN-MEEZAN-998877",
      proofPath: "payment-proofs/test-screenshot.png",
      guestToken: testGuestToken,
    });

    expect(submitResult.payment.status).toBe("verification_pending");
    expect(submitResult.payment.status).not.toBe("verified");
    expect(submitResult.order.paymentStatus).toBe("verification_pending");
    expect(submitResult.order.orderStatus).toBe("awaiting_verification");
    expect(submitResult.payment.paymentMethodSnapshot?.transactionId).toBe("TXN-MEEZAN-998877");
    expect(submitResult.payment.proofSubmittedAt).toBeDefined();
  });

  it("admin can verify payment: moves payment to 'verified' and order to 'confirmed'", async () => {
    const submitResult = await submitPaymentProof({
      orderReference: testOrderRef,
      methodId: "easypaisa",
      senderName: "Hira Salman",
      transactionId: "EP-445566",
      proofPath: "payment-proofs/ep.png",
      guestToken: testGuestToken,
    });

    const adminReview = await reviewPayment(
      {
        paymentId: submitResult.payment.id,
        action: "verify",
      },
      "admin-uuid-001"
    );

    expect(adminReview.payment.status).toBe("verified");
    expect(adminReview.payment.reviewedBy).toBe("admin-uuid-001");
    expect(adminReview.order.paymentStatus).toBe("verified");
    expect(adminReview.order.orderStatus).toBe("confirmed");
  });

  it("admin rejection requires reason, sets status to 'rejected', and leaves order 'on_hold'", async () => {
    const submitResult = await submitPaymentProof({
      orderReference: testOrderRef,
      methodId: "jazzcash",
      senderName: "Hira Salman",
      transactionId: "JC-112233",
      proofPath: "payment-proofs/jc.png",
      guestToken: testGuestToken,
    });

    const rejection = await reviewPayment(
      {
        paymentId: submitResult.payment.id,
        action: "reject",
        rejectionReason: "Transaction ID not found on studio account statement",
      },
      "admin-uuid-001"
    );

    expect(rejection.payment.status).toBe("rejected");
    expect(rejection.payment.rejectionReason).toBe(
      "Transaction ID not found on studio account statement"
    );
    expect(rejection.order.paymentStatus).toBe("rejected");
    expect(rejection.order.orderStatus).toBe("on_hold");
  });

  it("rejecting without a reason of at least 5 characters throws error", async () => {
    const submitResult = await submitPaymentProof({
      orderReference: testOrderRef,
      methodId: "jazzcash",
      senderName: "Hira Salman",
      transactionId: "JC-112233",
      proofPath: "payment-proofs/jc.png",
      guestToken: testGuestToken,
    });

    await expect(
      reviewPayment(
        {
          paymentId: submitResult.payment.id,
          action: "reject",
          rejectionReason: "bad",
        },
        "admin-uuid-001"
      )
    ).rejects.toThrow(/rejection reason of at least 5 characters/i);
  });

  it("prevents re-submitting proof when payment is already verified", async () => {
    const submitResult = await submitPaymentProof({
      orderReference: testOrderRef,
      methodId: "meezan",
      senderName: "Hira Salman",
      transactionId: "TXN-1",
      proofPath: "payment-proofs/p1.png",
      guestToken: testGuestToken,
    });

    await reviewPayment(
      {
        paymentId: submitResult.payment.id,
        action: "verify",
      },
      "admin-uuid-001"
    );

    await expect(
      submitPaymentProof({
        orderReference: testOrderRef,
        methodId: "meezan",
        senderName: "Hira Salman",
        transactionId: "TXN-2",
        proofPath: "payment-proofs/p2.png",
        guestToken: testGuestToken,
      })
    ).rejects.toThrow(/already been verified/i);
  });

  it("blocks submission from unauthorized user with invalid guest token", async () => {
    await expect(
      submitPaymentProof({
        orderReference: testOrderRef,
        methodId: "meezan",
        senderName: "Intruder",
        transactionId: "TXN-HACK",
        proofPath: "payment-proofs/bad.png",
        guestToken: "invalid-token",
      })
    ).rejects.toThrow(/not authorized/i);
  });

  it("does not regress an already shipped order back to confirmed when reviewPayment runs (H-01)", async () => {
    const submitResult = await submitPaymentProof({
      orderReference: testOrderRef,
      methodId: "meezan",
      senderName: "Hira Salman",
      transactionId: "TXN-SHIP-1",
      proofPath: "payment-proofs/pship.png",
      guestToken: testGuestToken,
    });

    // Advance order to shipped
    submitResult.order.orderStatus = "shipped";

    await reviewPayment(
      {
        paymentId: submitResult.payment.id,
        action: "verify",
      },
      "admin-uuid-001"
    );

    // Order status should remain "shipped", NOT regressed to "confirmed"
    expect(submitResult.order.orderStatus).toBe("shipped");
    expect(submitResult.order.paymentStatus).toBe("verified");
  });
});
