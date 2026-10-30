import { describe, it, expect } from "vitest";
import {
  calculateShippingFee,
  calculateOrderTotals,
  STANDARD_SHIPPING_FEE_MINOR,
  FREE_SHIPPING_THRESHOLD_MINOR,
} from "./shipping";

describe("Pakistani Shipping Fee Calculations", () => {
  it("charges standard delivery fee of Rs. 250 for orders below threshold", () => {
    // 1 item worth Rs. 1,200 (120,000 paisa)
    const fee = calculateShippingFee(120000);
    expect(fee).toBe(STANDARD_SHIPPING_FEE_MINOR);
    expect(fee).toBe(25000);
  });

  it("applies free delivery for orders exactly at Rs. 3,000 threshold", () => {
    const fee = calculateShippingFee(FREE_SHIPPING_THRESHOLD_MINOR);
    expect(fee).toBe(0);
  });

  it("applies free delivery for orders exceeding Rs. 3,000 threshold", () => {
    const fee = calculateShippingFee(350000); // Rs. 3,500
    expect(fee).toBe(0);
  });

  it("enforces strict boundary: Rs. 2,999 charges Rs. 250, Rs. 3,000 is free", () => {
    const subtotalBelow = 299900; // Rs. 2,999
    const subtotalAt = 300000; // Rs. 3,000

    expect(calculateShippingFee(subtotalBelow)).toBe(25000);
    expect(calculateShippingFee(subtotalAt)).toBe(0);
  });

  it("returns 0 shipping fee for empty cart (0 subtotal)", () => {
    expect(calculateShippingFee(0)).toBe(0);
  });

  it("calculates complete order totals with remaining threshold", () => {
    const items = [
      { unitPriceMinor: 100000, quantity: 2 }, // Rs. 2,000
    ];

    const totals = calculateOrderTotals(items);

    expect(totals.subtotalMinor).toBe(200000); // Rs. 2,000
    expect(totals.shippingMinor).toBe(25000); // Rs. 250
    expect(totals.totalMinor).toBe(225000); // Rs. 2,250
    expect(totals.freeShippingRemainingMinor).toBe(100000); // Rs. 1,000 more needed
    expect(totals.hasFreeShipping).toBe(false);
  });

  it("calculates complete order totals when free delivery unlocked", () => {
    const items = [
      { unitPriceMinor: 160000, quantity: 2 }, // Rs. 3,200
    ];

    const totals = calculateOrderTotals(items);

    expect(totals.subtotalMinor).toBe(320000); // Rs. 3,200
    expect(totals.shippingMinor).toBe(0);
    expect(totals.totalMinor).toBe(320000); // Rs. 3,200
    expect(totals.freeShippingRemainingMinor).toBe(0);
    expect(totals.hasFreeShipping).toBe(true);
  });
});
