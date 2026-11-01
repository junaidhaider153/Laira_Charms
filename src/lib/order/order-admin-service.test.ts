import { describe, it, expect, beforeEach } from "vitest";
import {
  transitionOrderStatus,
  getOrderHistory,
  listAdminOrders,
  getAdminOrderById,
} from "./order-admin-service";
import { createOrder } from "@/lib/checkout/order-service";
import type { CreateOrderInput } from "@/lib/checkout/types";

describe("Order Admin Service & State Transition Audit", () => {
  let testOrderId: string;
  let testOrderRef: string;

  beforeEach(async () => {
    const input: CreateOrderInput = {
      idempotencyKey: "lifecycle-test-" + Math.random(),
      address: {
        fullName: "Anum Tariq",
        email: "anum@example.com",
        phone: "03331234567",
        streetAddress: "House 55, Street 10",
        city: "Lahore",
        province: "Punjab",
        postalCode: "54000",
      },
      items: [
        {
          productId: "11111111-1111-1111-1111-111111111102",
          slug: "strawberry-matcha-charm",
          title: "Strawberry Matcha Charm",
          unitPriceMinor: 145000,
          quantity: 1,
        },
      ],
    };

    const res = await createOrder(input);
    testOrderId = res.order.id;
    testOrderRef = res.order.reference;
  });

  it("transitions order legally and records status history entry", async () => {
    // 1. Move from pending_payment to awaiting_verification
    const step1 = await transitionOrderStatus(
      testOrderId,
      "awaiting_verification",
      null,
      "customer",
      "Customer uploaded payment screenshot"
    );

    expect(step1.order.orderStatus).toBe("awaiting_verification");
    expect(step1.historyEntry.previousStatus).toBe("pending_payment");
    expect(step1.historyEntry.newStatus).toBe("awaiting_verification");

    // 2. Admin verifies payment and confirms order
    const step2 = await transitionOrderStatus(
      testOrderId,
      "confirmed",
      "admin-123",
      "admin",
      "Meezan Bank transfer reconciled"
    );

    expect(step2.order.orderStatus).toBe("confirmed");
    expect(step2.historyEntry.previousStatus).toBe("awaiting_verification");
    expect(step2.historyEntry.newStatus).toBe("confirmed");

    // 3. Check chronological history
    const history = await getOrderHistory(testOrderId);
    expect(history.length).toBeGreaterThanOrEqual(2);
    expect(history[history.length - 1].newStatus).toBe("confirmed");
  });

  it("blocks illegal status skips", async () => {
    // Current status is pending_payment. Attempting to skip directly to shipped should fail
    await expect(
      transitionOrderStatus(
        testOrderId,
        "shipped",
        "admin-123",
        "admin"
      )
    ).rejects.toThrow(/Illegal order transition/i);
  });

  it("enforces courier tracking details when transitioning to 'shipped'", async () => {
    // Advance to ready_to_ship first
    await transitionOrderStatus(testOrderId, "awaiting_verification", null, "customer");
    await transitionOrderStatus(testOrderId, "confirmed", "admin-1", "admin");
    await transitionOrderStatus(testOrderId, "in_production", "admin-1", "admin");
    await transitionOrderStatus(testOrderId, "ready_to_ship", "admin-1", "admin");

    // Attempting to ship without tracking should throw
    await expect(
      transitionOrderStatus(testOrderId, "shipped", "admin-1", "admin")
    ).rejects.toThrow(/tracking number is required/i);

    // Transition with valid courier tracking
    const shippedResult = await transitionOrderStatus(
      testOrderId,
      "shipped",
      "admin-1",
      "admin",
      undefined,
      {
        courierPartner: "Trax",
        trackingNumber: "TRX-98765432",
        trackingUrl: "https://sonic.pk/tracking?tracking_number=TRX-98765432",
      }
    );

    expect(shippedResult.order.orderStatus).toBe("shipped");
    expect(shippedResult.order.notes).toContain("Trax");
    expect(shippedResult.order.notes).toContain("TRX-98765432");
  });

  it("filters orders and counts queues accurately in listAdminOrders", async () => {
    const { orders, counts } = await listAdminOrders();

    expect(orders.length).toBeGreaterThan(0);
    expect(counts.all).toBeGreaterThan(0);
    expect(counts).toHaveProperty("awaiting_verification");
    expect(counts).toHaveProperty("in_production");
    expect(counts).toHaveProperty("shipped");

    // Test filter by query (search reference)
    const filtered = await listAdminOrders({ query: testOrderRef });
    expect(filtered.orders.length).toBe(1);
    expect(filtered.orders[0].reference).toBe(testOrderRef);
  });

  it("retrieves full order details and history in getAdminOrderById", async () => {
    const detail = await getAdminOrderById(testOrderRef);

    expect(detail).not.toBeNull();
    expect(detail?.order.reference).toBe(testOrderRef);
    expect(detail?.history).toBeDefined();
  });
});

