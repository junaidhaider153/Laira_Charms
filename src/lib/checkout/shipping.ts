/**
 * Shipping fee calculations and delivery thresholds for Pakistan.
 * All monetary amounts are in paisa integer minor units (1 PKR = 100 paisa).
 */

export const STANDARD_SHIPPING_FEE_MINOR = 25000; // Rs. 250 in paisa
export const FREE_SHIPPING_THRESHOLD_MINOR = 300000; // Rs. 3,000 in paisa

/**
 * Calculates delivery fee based on order subtotal in paisa.
 * Free delivery on orders of Rs. 3,000 or more across Pakistan.
 */
export function calculateShippingFee(subtotalMinor: number): number {
  if (subtotalMinor <= 0) return 0;
  if (subtotalMinor >= FREE_SHIPPING_THRESHOLD_MINOR) return 0;
  return STANDARD_SHIPPING_FEE_MINOR;
}

/**
 * Calculates complete order totals server-side and client-side.
 */
export function calculateOrderTotals(
  items: Array<{ unitPriceMinor: number; quantity: number }>
): {
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  freeShippingRemainingMinor: number;
  hasFreeShipping: boolean;
} {
  const subtotalMinor = items.reduce(
    (sum, item) => sum + Math.max(0, item.unitPriceMinor) * Math.max(1, item.quantity),
    0
  );

  const shippingMinor = calculateShippingFee(subtotalMinor);
  const totalMinor = subtotalMinor + shippingMinor;
  const freeShippingRemainingMinor = Math.max(0, FREE_SHIPPING_THRESHOLD_MINOR - subtotalMinor);
  const hasFreeShipping = subtotalMinor >= FREE_SHIPPING_THRESHOLD_MINOR;

  return {
    subtotalMinor,
    shippingMinor,
    totalMinor,
    freeShippingRemainingMinor,
    hasFreeShipping,
  };
}


