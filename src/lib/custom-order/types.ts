import type {
  CustomRequestStatus,
  QuotationStatus,
} from "@/lib/supabase/types";
import type { CreateCustomRequestInput, QuoteDecisionInput } from "./schemas";

export type { CustomRequestStatus, QuotationStatus, CreateCustomRequestInput, QuoteDecisionInput };

export interface CustomRequestMediaItem {
  id: string;
  requestId: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl?: string;
  createdAt: string;
}

export interface CustomRequest {
  id: string;
  customerId: string | null;
  guestEmail: string | null;
  guestTokenHash: string | null;
  title: string;
  brief: string;
  productReferenceId: string | null;
  desiredDeliveryDate: string | null;
  status: CustomRequestStatus;
  assignedAdminId: string | null;
  media: CustomRequestMediaItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  requestId: string;
  version: number;
  status: QuotationStatus;
  amountMinor: number;
  currency: string;
  scope: string;
  productionDays: number;
  validUntil: string;
  createdBy: string | null;
  acceptedAt: string | null;
  createdAt: string;
  isExpired: boolean;
}
