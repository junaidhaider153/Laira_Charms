import { z } from "zod";
import { PAKISTANI_PROVINCES, type PakistaniProvince } from "./types";

export const PAKISTANI_PHONE_REGEX = /^(?:03\d{9}|\+923\d{9})$/;
export const PAKISTANI_POSTAL_CODE_REGEX = /^\d{5}$/;

const PROVINCES_TUPLE = PAKISTANI_PROVINCES as [PakistaniProvince, ...PakistaniProvince[]];

export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(
      PAKISTANI_PHONE_REGEX,
      "Please enter a valid Pakistani mobile number (e.g. 03001234567 or +923001234567)"
    ),
  streetAddress: z
    .string()
    .trim()
    .min(5, "Street address must be at least 5 characters")
    .max(250, "Address cannot exceed 250 characters"),
  city: z
    .string()
    .trim()
    .min(2, "City name must be at least 2 characters")
    .max(80, "City cannot exceed 80 characters"),
  province: z.enum(PROVINCES_TUPLE, {
    errorMap: () => ({ message: "Please select a valid Pakistani province or territory" }),
  }),
  postalCode: z
    .string()
    .trim()
    .regex(
      PAKISTANI_POSTAL_CODE_REGEX,
      "Please enter a valid 5-digit Pakistani postal code (e.g. 54000 or 44000)"
    ),
  orderNotes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
});

export const checkoutLineItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  slug: z.string().min(1, "Product slug is required"),
  title: z.string().min(1, "Product title is required"),
  unitPriceMinor: z.number().int().nonnegative("Unit price must be non-negative").optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(50, "Max quantity is 50"),
  imageUrl: z.string().optional(),
  customization: z.record(z.string()).optional(),
  customText: z.string().max(50).optional(),
});

export const createOrderSchema = z.object({
  idempotencyKey: z
    .string()
    .min(10, "A unique idempotency key is required to prevent duplicate orders"),
  address: shippingAddressSchema,
  items: z
    .array(checkoutLineItemSchema)
    .min(1, "Your cart is empty. Please add at least one keepsake charm to order."),
});

export type ShippingAddressFormInput = z.infer<typeof shippingAddressSchema>;
export type CreateOrderInputSchema = z.infer<typeof createOrderSchema>;
