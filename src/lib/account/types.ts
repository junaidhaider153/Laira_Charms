import type { PakistaniProvince } from "@/lib/checkout/types";

export interface CustomerAddress {
  id: string;
  userId: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  province: PakistaniProvince;
  postalCode?: string | null;
  deliveryNotes?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveAddressInput {
  id?: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  province: PakistaniProvince;
  postalCode?: string | null;
  deliveryNotes?: string | null;
  isDefault?: boolean;
}

