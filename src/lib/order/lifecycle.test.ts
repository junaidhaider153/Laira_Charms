import { describe, it, expect } from "vitest";
import {
  canTransitionOrderStatus,
  getNextAllowedOrderStatuses,
  formatOrderStatus,
} from "./lifecycle";

describe("Order Lifecycle & State Machine Transitions", () => {
  it("allows standard linear production lifecycle transitions", () => {
    expect(canTransitionOrderStatus("pending_payment", "awaiting_verification")).toBe(true);
    expect(canTransitionOrderStatus("awaiting_verification", "confirmed")).toBe(true);
    expect(canTransitionOrderStatus("confirmed", "in_production")).toBe(true);
    expect(canTransitionOrderStatus("in_production", "ready_to_ship")).toBe(true);
    expect(canTransitionOrderStatus("ready_to_ship", "shipped")).toBe(true);
    expect(canTransitionOrderStatus("shipped", "delivered")).toBe(true);
  });

  it("blocks illegal status skips or reverse transitions", () => {
    // Cannot jump directly from payment pending to shipped
    expect(canTransitionOrderStatus("pending_payment", "shipped")).toBe(false);
    expect(canTransitionOrderStatus("pending_payment", "delivered")).toBe(false);

    // Cannot jump backwards from delivered to in_production
    expect(canTransitionOrderStatus("delivered", "in_production")).toBe(false);
    expect(canTransitionOrderStatus("shipped", "in_production")).toBe(false);

    // Cannot transition to identical status
    expect(canTransitionOrderStatus("confirmed", "confirmed")).toBe(false);
  });

  it("handles exception paths via 'on_hold'", () => {
    // Can put order on hold during production or shipping prep
    expect(canTransitionOrderStatus("in_production", "on_hold")).toBe(true);
    expect(canTransitionOrderStatus("awaiting_verification", "on_hold")).toBe(true);
    expect(canTransitionOrderStatus("ready_to_ship", "on_hold")).toBe(true);

    // Can resume from on_hold back into production or confirmed
    expect(canTransitionOrderStatus("on_hold", "in_production")).toBe(true);
    expect(canTransitionOrderStatus("on_hold", "confirmed")).toBe(true);
  });

  it("enforces terminal states for cancelled, refunded, and delivered orders", () => {
    expect(getNextAllowedOrderStatuses("cancelled")).toEqual([]);
    expect(getNextAllowedOrderStatuses("refunded")).toEqual([]);
    expect(getNextAllowedOrderStatuses("delivered")).toEqual([]);
    expect(canTransitionOrderStatus("cancelled", "confirmed")).toBe(false);
    expect(canTransitionOrderStatus("refunded", "in_production")).toBe(false);
    expect(canTransitionOrderStatus("delivered", "refunded")).toBe(false);
  });

  it("provides helpful labels and badge styling for display", () => {
    const pending = formatOrderStatus("pending_payment");
    expect(pending.label).toBe("Awaiting Payment");

    const inProd = formatOrderStatus("in_production");
    expect(inProd.label).toBe("In Production");
    expect(inProd.description).toContain("sculpting");

    const shipped = formatOrderStatus("shipped");
    expect(shipped.label).toBe("Dispatched");
  });
});
