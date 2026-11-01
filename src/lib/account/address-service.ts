import crypto from "crypto";
import { z } from "zod";
import { PAKISTANI_PROVINCES, type PakistaniProvince } from "@/lib/checkout/types";
import type { CustomerAddress, SaveAddressInput } from "./types";

const PAKISTANI_PHONE_REGEX = /^(?:03\d{9}|\+923\d{9})$/;

export const addressSchema = z.object({
  id: z.string().optional(),
  recipientName: z
    .string()
    .trim()
    .min(2, "Recipient name must be at least 2 characters")
    .max(100),
  phone: z
    .string()
    .trim()
    .regex(
      PAKISTANI_PHONE_REGEX,
      "Please enter a valid Pakistani mobile number (e.g., 03001234567)"
    ),
  addressLine1: z
    .string()
    .trim()
    .min(5, "Street address must be at least 5 characters")
    .max(200),
  addressLine2: z.string().trim().max(200).optional().nullable(),
  city: z
    .string()
    .trim()
    .min(2, "City name must be at least 2 characters")
    .max(50),
  province: z.enum(PAKISTANI_PROVINCES as [PakistaniProvince, ...PakistaniProvince[]], {
    errorMap: () => ({ message: "Please select a valid Pakistani province/territory" }),
  }),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Postal code must be exactly 5 digits")
    .optional()
    .nullable(),
  deliveryNotes: z.string().trim().max(300).optional().nullable(),
  isDefault: z.boolean().optional().default(false),
});

export const MEMORY_ADDRESSES: Map<string, CustomerAddress[]> = new Map();

// Sample customer addresses fixture
export const SAMPLE_CUSTOMER_USER_ID = "cust-sample-123";
MEMORY_ADDRESSES.set(SAMPLE_CUSTOMER_USER_ID, [
  {
    id: "addr-sample-01",
    userId: SAMPLE_CUSTOMER_USER_ID,
    recipientName: "Ayesha Noor",
    phone: "03001234567",
    addressLine1: "House 14-B, Street 3, Sector F-7/1",
    addressLine2: null,
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    postalCode: "44000",
    deliveryNotes: "Leave at front gate if not answering bell.",
    isDefault: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "addr-sample-02",
    userId: SAMPLE_CUSTOMER_USER_ID,
    recipientName: "Ayesha Noor (Studio)",
    phone: "03001234567",
    addressLine1: "Office 402, Evacuee Trust Complex, F-5/1",
    addressLine2: "4th Floor",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    postalCode: "44000",
    deliveryNotes: null,
    isDefault: false,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
]);

/**
 * Lists all saved addresses for a customer, with the default address first.
 */
export async function listAddresses(userId: string): Promise<CustomerAddress[]> {
  const list = MEMORY_ADDRESSES.get(userId) || [];
  return [...list].sort((a, b) => {
    if (a.isDefault) return -1;
    if (b.isDefault) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Saves (creates or updates) a customer delivery address.
 */
export async function saveAddress(
  userId: string,
  input: SaveAddressInput
): Promise<CustomerAddress> {
  const parsed = addressSchema.parse(input);
  const userAddresses = MEMORY_ADDRESSES.get(userId) || [];
  const now = new Date().toISOString();

  // If this is the user's first address, force isDefault to true
  const shouldBeDefault = userAddresses.length === 0 ? true : Boolean(parsed.isDefault);

  // If new/updated address is default, unset default on all other addresses
  if (shouldBeDefault) {
    userAddresses.forEach((a) => (a.isDefault = false));
  }

  let savedAddress: CustomerAddress;

  if (parsed.id) {
    // Update existing
    const existingIndex = userAddresses.findIndex((a) => a.id === parsed.id);
    if (existingIndex === -1) {
      throw new Error("Address not found.");
    }

    savedAddress = {
      ...userAddresses[existingIndex],
      recipientName: parsed.recipientName,
      phone: parsed.phone,
      addressLine1: parsed.addressLine1,
      addressLine2: parsed.addressLine2 || null,
      city: parsed.city,
      province: parsed.province,
      postalCode: parsed.postalCode || null,
      deliveryNotes: parsed.deliveryNotes || null,
      isDefault: shouldBeDefault,
      updatedAt: now,
    };
    userAddresses[existingIndex] = savedAddress;
  } else {
    // Create new
    savedAddress = {
      id: `addr-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      recipientName: parsed.recipientName,
      phone: parsed.phone,
      addressLine1: parsed.addressLine1,
      addressLine2: parsed.addressLine2 || null,
      city: parsed.city,
      province: parsed.province,
      postalCode: parsed.postalCode || null,
      deliveryNotes: parsed.deliveryNotes || null,
      isDefault: shouldBeDefault,
      createdAt: now,
      updatedAt: now,
    };
    userAddresses.push(savedAddress);
  }

  MEMORY_ADDRESSES.set(userId, userAddresses);
  return savedAddress;
}

/**
 * Deletes an address. If the deleted address was default, reassigns default.
 */
export async function deleteAddress(
  userId: string,
  addressId: string
): Promise<void> {
  let userAddresses = MEMORY_ADDRESSES.get(userId) || [];
  const target = userAddresses.find((a) => a.id === addressId);
  if (!target) {
    throw new Error("Address not found.");
  }

  userAddresses = userAddresses.filter((a) => a.id !== addressId);

  // If target was default and other addresses exist, make first remaining default
  if (target.isDefault && userAddresses.length > 0) {
    userAddresses[0].isDefault = true;
  }

  MEMORY_ADDRESSES.set(userId, userAddresses);
}

/**
 * Sets an address as the default delivery destination.
 */
export async function setDefaultAddress(
  userId: string,
  addressId: string
): Promise<CustomerAddress> {
  const userAddresses = MEMORY_ADDRESSES.get(userId) || [];
  const target = userAddresses.find((a) => a.id === addressId);
  if (!target) {
    throw new Error("Address not found.");
  }

  userAddresses.forEach((a) => {
    a.isDefault = a.id === addressId;
  });

  MEMORY_ADDRESSES.set(userId, userAddresses);
  return target;
}

