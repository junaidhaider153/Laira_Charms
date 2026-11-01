import { z } from "zod";

export const PAKISTANI_PHONE_REGEX = /^(?:03\d{9}|\+923\d{9})$/;

/**
 * Checks if a requested delivery date allows the studio minimum craft lead time (at least 7 days).
 */
export function isDeliveryDateAcceptable(dateStr?: string | null): boolean {
  if (!dateStr) return true;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return false;

  const minAcceptableDate = new Date();
  minAcceptableDate.setHours(0, 0, 0, 0);
  minAcceptableDate.setDate(minAcceptableDate.getDate() + 6); // 7th day onward

  return target >= minAcceptableDate;
}

export const createCustomRequestSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  brief: z
    .string()
    .min(15, "Please provide a brief description of at least 15 characters")
    .max(3000, "Brief cannot exceed 3000 characters"),
  desiredDeliveryDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || isDeliveryDateAcceptable(val),
      "Studio requires at least 7 days advance notice for handmade bespoke sculpting"
    ),
  customerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name cannot exceed 60 characters"),
  customerEmail: z
    .string()
    .email("Please enter a valid email address"),
  customerPhone: z
    .string()
    .regex(
      PAKISTANI_PHONE_REGEX,
      "Please enter a valid Pakistani mobile number (e.g. 03001234567 or +923001234567)"
    ),
  productReferenceId: z.string().optional(),
});

export type CreateCustomRequestInput = z.infer<typeof createCustomRequestSchema>;

export const quoteDecisionSchema = z.object({
  quotationId: z.string().uuid("Invalid quotation ID"),
  action: z.enum(["accept", "decline"]),
  declineReason: z.string().max(500).optional(),
  guestToken: z.string().optional(),
});

export type QuoteDecisionInput = z.infer<typeof quoteDecisionSchema>;

