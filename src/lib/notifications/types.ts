export type NotificationEventType =
  | 'verify_email'
  | 'password_reset'
  | 'guest_access'
  | 'quotation_issued'
  | 'quotation_expiring'
  | 'order_placed'
  | 'proof_received'
  | 'proof_rejected'
  | 'payment_verified'
  | 'order_in_production'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'new_message';

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'dead_letter';

export interface NotificationPayload {
  recipientEmail: string;
  recipientName: string;
  eventType: NotificationEventType;
  idempotencyKey: string;
  data: Record<string, unknown>;
}

export interface RenderedEmail {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface OutboxRecord {
  id: string;
  eventType: NotificationEventType;
  idempotencyKey: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  metadata: Record<string, unknown>;
  status: NotificationStatus;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  nextAttemptAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailProviderResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IEmailProvider {
  sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string
  ): Promise<EmailProviderResponse>;
}

