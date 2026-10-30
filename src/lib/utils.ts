import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes cleanly and resolves conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats minor currency units (paisa in PKR, where 1 PKR = 100 paisa)
 * into human-readable currency strings.
 * Never uses floating-point arithmetic.
 */
export function formatMoney(amountMinor: number, currency: string = "PKR"): string {
  if (isNaN(amountMinor) || !isFinite(amountMinor)) {
    return `${currency} 0.00`;
  }

  const isNegative = amountMinor < 0;
  const absMinor = Math.abs(Math.round(amountMinor));
  const major = Math.floor(absMinor / 100);
  const minor = absMinor % 100;
  const formattedMajor = major.toLocaleString("en-PK");
  const formattedMinor = minor.toString().padStart(2, "0");

  const sign = isNegative ? "-" : "";
  // In Pakistan commerce, both "Rs. 1,500" and "PKR 1,500" are common.
  // Standard format: Rs. 1,500 (or PKR 1,500.00)
  if (minor === 0) {
    return `${sign}Rs. ${formattedMajor}`;
  }
  return `${sign}Rs. ${formattedMajor}.${formattedMinor}`;
}

/**
 * Converts decimal amount (e.g. 150.50) safely to integer minor units (paisa).
 */
export function toMinorUnits(majorAmount: number | string): number {
  if (typeof majorAmount === "string") {
    majorAmount = parseFloat(majorAmount.trim());
  }
  if (isNaN(majorAmount) || !isFinite(majorAmount)) {
    return 0;
  }
  return Math.round(majorAmount * 100);
}
