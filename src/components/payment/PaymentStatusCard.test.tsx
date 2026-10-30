import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PaymentStatusCard } from "./PaymentStatusCard";
import type { Order } from "@/lib/checkout/types";
import type { PaymentRecord } from "@/lib/payment/types";

const mockOrder: Order = {
  id: "order-test-uuid-1",
  reference: "LC-20261031-1122",
  customerId: null,
  guestEmail: "ayesha@example.com",
  guestTokenHash: null,
  shippingAddressSnapshot: {
    fullName: "Ayesha Noor",
    email: "ayesha@example.com",
    phone: "03001234567",
    streetAddress: "House 14, Street 3",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    postalCode: "44000",
  },
  subtotalMinor: 200000,
  shippingMinor: 25000,
  totalMinor: 225000, // Rs. 2,250
  currency: "PKR",
  orderStatus: "pending_payment",
  paymentStatus: "awaiting_payment",
  notes: null,
  idempotencyKey: "test-key-1",
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const basePayment: PaymentRecord = {
  id: "pay-test-uuid-1",
  orderId: "order-test-uuid-1",
  orderReference: "LC-20261031-1122",
  amountMinor: 225000,
  currency: "PKR",
  status: "awaiting_payment",
  paymentMethodSnapshot: null,
  proofStoragePath: null,
  proofSubmittedAt: null,
  reviewedBy: null,
  reviewedAt: null,
  rejectionReason: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("PaymentStatusCard Component", () => {
  it("renders Pakistani bank transfer instructions when awaiting payment", () => {
    render(<PaymentStatusCard order={mockOrder} initialPayment={basePayment} />);

    expect(screen.getByText(/Bank & Wallet Transfer Details/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Meezan Bank Limited/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/EasyPaisa/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/JazzCash/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Upload Payment Proof Screenshot/i)).toBeInTheDocument();
  });

  it("renders review banner when payment is verification_pending", () => {
    const pendingPayment: PaymentRecord = {
      ...basePayment,
      status: "verification_pending",
      proofSubmittedAt: new Date().toISOString(),
      paymentMethodSnapshot: {
        methodId: "meezan",
        methodName: "Meezan Bank Limited",
        senderName: "Ayesha Noor",
        transactionId: "TXN-998877",
        accountTitle: "Laira Charms Studio",
        accountNumber: "02100109876543",
      },
    };

    render(<PaymentStatusCard order={mockOrder} initialPayment={pendingPayment} />);

    expect(screen.getByText(/Under Studio Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Payment Proof Received/i)).toBeInTheDocument();
    expect(screen.getByText(/TXN-998877/i)).toBeInTheDocument();
  });

  it("renders verified banner when payment is confirmed", () => {
    const verifiedPayment: PaymentRecord = {
      ...basePayment,
      status: "verified",
      reviewedBy: "admin-1",
      reviewedAt: new Date().toISOString(),
    };

    render(<PaymentStatusCard order={mockOrder} initialPayment={verifiedPayment} />);

    expect(screen.getByText(/Payment Verified • Confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Payment is Confirmed!/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View Order Confirmation/i })).toBeInTheDocument();
  });

  it("renders rejection alert with artisan note when payment is rejected", () => {
    const rejectedPayment: PaymentRecord = {
      ...basePayment,
      status: "rejected",
      rejectionReason: "Screenshot blur; transaction ID was unreadable.",
    };

    render(<PaymentStatusCard order={mockOrder} initialPayment={rejectedPayment} />);

    expect(screen.getByText(/Payment Verification Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/Screenshot blur; transaction ID was unreadable./i)).toBeInTheDocument();
    expect(screen.getByText(/Upload Payment Proof Screenshot/i)).toBeInTheDocument();
  });
});
