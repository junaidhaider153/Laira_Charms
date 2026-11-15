/**
 * Shipping fee calculations and delivery thresholds for Pakistan.
 * All monetary amounts are in paisa integer minor units (1 PKR = 100 paisa).
 */

export const STANDARD_SHIPPING_FEE_MINOR = 25000; // Rs. 250 in paisa
export const FREE_SHIPPING_THRESHOLD_MINOR = 300000; // Rs. 3,000 in paisa

/**
 * Calculates delivery fee based on order subtotal in paisa.
 * Supports configurable rates from store settings with standard fallback.
 */
export function calculateShippingFee(
  subtotalMinor: number,
  options?: { standardRateMinor?: number; freeShippingThresholdMinor?: number }
): number {
  const standardFee = options?.standardRateMinor ?? STANDARD_SHIPPING_FEE_MINOR;
  const threshold = options?.freeShippingThresholdMinor ?? FREE_SHIPPING_THRESHOLD_MINOR;
  if (subtotalMinor <= 0) return 0;
  if (threshold > 0 && subtotalMinor >= threshold) return 0;
  return standardFee;
}

/**
 * Calculates complete order totals server-side and client-side.
 */
export function calculateOrderTotals(
  items: Array<{ unitPriceMinor: number; quantity: number }>,
  options?: { standardRateMinor?: number; freeShippingThresholdMinor?: number }
): {
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  freeShippingRemainingMinor: number;
  hasFreeShipping: boolean;
} {
  const standardFee = options?.standardRateMinor ?? STANDARD_SHIPPING_FEE_MINOR;
  const threshold = options?.freeShippingThresholdMinor ?? FREE_SHIPPING_THRESHOLD_MINOR;

  const subtotalMinor = items.reduce(
    (sum, item) => sum + Math.max(0, item.unitPriceMinor) * Math.max(1, item.quantity),
    0
  );

  const shippingMinor = calculateShippingFee(subtotalMinor, {
    standardRateMinor: standardFee,
    freeShippingThresholdMinor: threshold,
  });
  const totalMinor = subtotalMinor + shippingMinor;
  const freeShippingRemainingMinor = threshold > 0 ? Math.max(0, threshold - subtotalMinor) : 0;
  const hasFreeShipping = threshold > 0 && subtotalMinor >= threshold;

  return {
    subtotalMinor,
    shippingMinor,
    totalMinor,
    freeShippingRemainingMinor,
    hasFreeShipping,
  };
}


