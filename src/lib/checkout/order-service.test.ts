import { describe, it, expect } from "vitest";
import {
  createOrder,
  getOrderByReference,
  generateOrderReference,
} from "./order-service";
import type { CreateOrderInput } from "./types";

describe("Order Service & Idempotency", () => {
  const baseOrderInput: CreateOrderInput = {
    idempotencyKey: "test-idempotency-key-abc-123",
    address: {
      fullName: "Fatima Zahra",
      email: "fatima.zahra@example.com",
      phone: "03011234567",
      streetAddress: "House 22, Street 5, DHA Phase 5",
      city: "Lahore",
      province: "Punjab",
      postalCode: "54000",
      orderNotes: "Leave at gate if unavailable",
    },
    items: [
      {
        productId: "11111111-1111-1111-1111-111111111102",
        slug: "strawberry-matcha-latte-charm",
        title: "Strawberry Matcha Latte Charm",
        unitPriceMinor: 145000, // Rs. 1,450
        quantity: 2,
        customization: { Palette: "Matcha Cream Swirl" },
      },
    ],
  };

  it("generates a human-friendly Pakistani order reference format", () => {
    const ref = generateOrderReference();
    expect(ref).toMatch(/^LC-\d{8}-[A-F0-9]{4}$/);
  });

  it("creates an order with server-calculated totals and guest token", async () => {
    const result = await createOrder(baseOrderInput);

    expect(result.order).toBeDefined();
    expect(result.order.reference).toMatch(/^LC-/);
    expect(result.order.subtotalMinor).toBe(290000); // Rs. 2,900
    expect(result.order.shippingMinor).toBe(25000); // Rs. 250 (under Rs. 3,000 threshold)
    expect(result.order.totalMinor).toBe(315000); // Rs. 3,150
    expect(result.order.orderStatus).toBe("pending_payment");
    expect(result.order.paymentStatus).toBe("awaiting_payment");
    expect(result.guestToken).toBeDefined();
    expect(result.orderUrl).toContain(result.order.reference);
  });

  it("enforces idempotency: repeated request with same key returns existing order", async () => {
    const uniqueKey = "idempotency-dedup-test-" + Date.now();
    const inputWithKey: CreateOrderInput = {
      ...baseOrderInput,
      idempotencyKey: uniqueKey,
    };

    const firstResult = await createOrder(inputWithKey);
    const secondResult = await createOrder(inputWithKey);

    expect(firstResult.order.id).toBe(secondResult.order.id);
    expect(firstResult.order.reference).toBe(secondResult.order.reference);
    expect(firstResult.orderUrl).toContain(firstResult.order.reference);
    expect(secondResult.orderUrl).toContain(firstResult.order.reference);
  });

  it("allows guest to retrieve order using valid guest token", async () => {
    const uniqueKey = "guest-retrieval-test-" + Date.now();
    const input: CreateOrderInput = {
      ...baseOrderInput,
      idempotencyKey: uniqueKey,
      address: {
        ...baseOrderInput.address,
        email: "guest.test@example.com",
      },
    };

    const { order, guestToken } = await createOrder(input);

    // Valid guest token lookup
    const retrieved = await getOrderByReference(order.reference, guestToken);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(order.id);
    expect(retrieved?.shippingAddressSnapshot.fullName).toBe("Fatima Zahra");

    // Invalid / tampered guest token lookup fails
    const unauthorized = await getOrderByReference(order.reference, "invalid-tampered-token");
    expect(unauthorized).toBeNull();
  });

  it("allows admin to retrieve order without guest token", async () => {
    const uniqueKey = "admin-retrieval-test-" + Date.now();
    const input: CreateOrderInput = {
      ...baseOrderInput,
      idempotencyKey: uniqueKey,
    };

    const { order } = await createOrder(input);

    const retrievedByAdmin = await getOrderByReference(order.reference, undefined, undefined, true);
    expect(retrievedByAdmin).not.toBeNull();
    expect(retrievedByAdmin?.id).toBe(order.id);
  });

  it("prevents client price tampering: recomputes authoritative prices on server", async () => {
    const tamperedInput: CreateOrderInput = {
      ...baseOrderInput,
      idempotencyKey: "tampering-test-" + Date.now(),
      items: [
        {
          productId: "11111111-1111-1111-1111-111111111102",
          slug: "strawberry-matcha-latte-charm",
          title: "Strawberry Matcha Latte Charm",
          unitPriceMinor: 0, // Malicious client attempts Rs. 0
          quantity: 2,
        },
      ],
    };

    const result = await createOrder(tamperedInput);

    // Server must reject client's Rs. 0 and authoritatively enforce base price (Rs. 1,450 = 145000 paisa)
    expect(result.order.items[0].unitPriceMinor).toBe(145000);
    expect(result.order.items[0].totalMinor).toBe(290000);
    expect(result.order.subtotalMinor).toBe(290000);
    expect(result.order.totalMinor).toBe(315000);
  });
});
