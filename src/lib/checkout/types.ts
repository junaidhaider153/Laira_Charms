import type { OrderStatus, PaymentStatus } from "@/lib/supabase/types";

export type PakistaniProvince =
  | "Punjab"
  | "Sindh"
  | "Khyber Pakhtunkhwa"
  | "Balochistan"
  | "Islamabad Capital Territory"
  | "Azad Kashmir"
  | "Gilgit-Baltistan";

export const PAKISTANI_PROVINCES: PakistaniProvince[] = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Kashmir",
  "Gilgit-Baltistan",
];

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  province: PakistaniProvince;
  postalCode: string;
  orderNotes?: string;
}

export interface CheckoutLineItem {
  productId: string;
  slug: string;
  title: string;
  unitPriceMinor: number;
  quantity: number;
  imageUrl?: string;
  customization?: Record<string, string>;
  customText?: string;
}

export interface CreateOrderInput {
  idempotencyKey: string;
  address: ShippingAddress;
  items: CheckoutLineItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productTitle: string;
  unitPriceMinor: number;
  quantity: number;
  totalMinor: number;
  customizationSnapshot: {
    customization?: Record<string, string>;
    customText?: string;
    imageUrl?: string;
    slug?: string;
  } | null;
  createdAt: string;
}

export interface Order {
  id: string;
  reference: string;
  customerId: string | null;
  guestEmail: string | null;
  guestTokenHash: string | null;
  shippingAddressSnapshot: ShippingAddress;
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  currency: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  notes: string | null;
  idempotencyKey: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export type { OrderStatus, PaymentStatus };
