import type { PaymentStatus } from "@/lib/supabase/types";

export type { PaymentStatus };

export interface PaymentMethodDetails {
  methodId: string;
  methodName: string;
  senderName: string;
  transactionId: string;
  accountTitle: string;
  accountNumber: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderReference: string;
  amountMinor: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodSnapshot: PaymentMethodDetails | null;
  proofStoragePath: string | null;
  proofSubmittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitPaymentProofInput {
  orderReference: string;
  methodId: string;
  senderName: string;
  transactionId: string;
  proofPath: string;
  guestToken?: string;
}

export interface ReviewPaymentInput {
  paymentId: string;
  action: "verify" | "reject";
  rejectionReason?: string;
}

