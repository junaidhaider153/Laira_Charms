import {
  NotificationPayload,
  NotificationStatus,
  OutboxRecord,
  IEmailProvider,
  EmailProviderResponse,
} from './types';
import { renderEmail } from './email-templates';
import { createAdminClient } from '../supabase/admin';
import { ResendEmailProvider } from './resend-provider';

export { ResendEmailProvider };

// In-memory fallback store for test environments or offline mock mode
const inMemoryOutbox = new Map<string, OutboxRecord>();

interface OutboxDbRow {
  id: string;
  event_type: string;
  idempotency_key: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  html_content: string;
  text_content: string;
  metadata: unknown;
  status: NotificationStatus;
  attempts: number;
  max_attempts: number;
  last_attempt_at: string | null;
  next_attempt_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

interface SupabaseOutboxTable {
  select: (cols: string) => {
    eq: (col: string, val: string) => {
      maybeSingle: () => Promise<{ data: OutboxDbRow | null; error: Error | null }>;
    };
    or: (condition: string) => {
      limit: (lim: number) => Promise<{ data: Array<{ id: string }> | null; error: Error | null }>;
    };
  };
  insert: (row: Record<string, unknown>) => {
    select: (cols: string) => {
      single: () => Promise<{ data: { id: string; status: NotificationStatus } | null; error: Error | null }>;
    };
  };
  update: (row: Record<string, unknown>) => {
    eq: (col: string, val: string) => Promise<{ data: unknown; error: Error | null }>;
  };
}

function getOutboxTable(supabase: ReturnType<typeof createAdminClient>): SupabaseOutboxTable {
  return supabase.from('notification_outbox') as unknown as SupabaseOutboxTable;
}

export class ConsoleEmailProvider implements IEmailProvider {
  async sendEmail(
    to: string,
    subject: string,
    _html: string,
    _text: string
  ): Promise<EmailProviderResponse> {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[EmailProvider] Sent email to: ${to} | Subject: ${subject}`);
    }
    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
  }
}

export class MockFailingEmailProvider implements IEmailProvider {
  private failCount: number;
  private currentAttempts = 0;

  constructor(failCount: number = Infinity) {
    this.failCount = failCount;
  }

  async sendEmail(): Promise<EmailProviderResponse> {
    this.currentAttempts++;
    if (this.currentAttempts <= this.failCount) {
      return {
        success: false,
        error: `Simulated SMTP connection timeout (attempt ${this.currentAttempts})`,
      };
    }
    return {
      success: true,
      messageId: `mock_success_${Date.now()}`,
    };
  }
}

export function getActiveEmailProvider(): IEmailProvider {
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("re_dummy")) {
    return new ResendEmailProvider();
  }
  return new ConsoleEmailProvider();
}

const defaultProvider: IEmailProvider = {
  sendEmail: (to, subject, html, text) => getActiveEmailProvider().sendEmail(to, subject, html, text),
};

export function calculateBackoffMs(
  attempt: number,
  baseDelayMs: number = 30000
): number {
  const exponent = Math.max(0, attempt - 1);
  return baseDelayMs * Math.pow(2, exponent);
}

export function clearInMemoryOutbox(): void {
  inMemoryOutbox.clear();
}

export function getInMemoryOutboxRecord(id: string): OutboxRecord | undefined {
  return inMemoryOutbox.get(id);
}

function isLiveSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('dummy') && !url.includes('example.com'));
}

export async function enqueueNotification(
  payload: NotificationPayload
): Promise<{ outboxId: string; status: NotificationStatus; isDuplicate: boolean }> {
  const { recipientEmail, recipientName, eventType, idempotencyKey, data } = payload;
  const rendered = renderEmail(payload);

  if (!isLiveSupabase()) {
    // Check for existing idempotency key in memory
    for (const record of inMemoryOutbox.values()) {
      if (record.idempotencyKey === idempotencyKey) {
        return {
          outboxId: record.id,
          status: record.status,
          isDuplicate: true,
        };
      }
    }

    const outboxId = `outbox_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const newRecord: OutboxRecord = {
      id: outboxId,
      eventType,
      idempotencyKey,
      recipientEmail,
      recipientName,
      subject: rendered.subject,
      htmlContent: rendered.htmlContent,
      textContent: rendered.textContent,
      metadata: data,
      status: 'pending',
      attempts: 0,
      maxAttempts: 5,
      createdAt: now,
      updatedAt: now,
    };

    inMemoryOutbox.set(outboxId, newRecord);
    return {
      outboxId,
      status: 'pending',
      isDuplicate: false,
    };
  }

  const supabase = createAdminClient();
  const table = getOutboxTable(supabase);

  // Check duplicate idempotency key in Supabase
  const { data: existing } = await table
    .select('id, status')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existing) {
    return {
      outboxId: existing.id,
      status: existing.status,
      isDuplicate: true,
    };
  }

  const { data: inserted, error } = await table
    .insert({
      event_type: eventType,
      idempotency_key: idempotencyKey,
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      subject: rendered.subject,
      html_content: rendered.htmlContent,
      text_content: rendered.textContent,
      metadata: data,
      status: 'pending',
      attempts: 0,
      max_attempts: 5,
    })
    .select('id, status')
    .single();

  if (error || !inserted) {
    throw new Error(`Failed to enqueue notification: ${error?.message || 'Database insert error'}`);
  }

  return {
    outboxId: inserted.id,
    status: inserted.status,
    isDuplicate: false,
  };
}

export async function processOutboxRecord(
  recordId: string,
  provider: IEmailProvider = defaultProvider,
  baseDelayMs: number = 30000
): Promise<OutboxRecord | null> {
  if (!isLiveSupabase()) {
    const record = inMemoryOutbox.get(recordId);
    if (!record) return null;
    if (record.status === 'sent' || record.status === 'dead_letter') {
      return record;
    }

    const res = await provider.sendEmail(
      record.recipientEmail,
      record.subject,
      record.htmlContent,
      record.textContent
    );

    const now = new Date();
    record.lastAttemptAt = now.toISOString();
    record.attempts += 1;
    record.updatedAt = now.toISOString();

    if (res.success) {
      record.status = 'sent';
      record.lastError = undefined;
      record.nextAttemptAt = undefined;
    } else {
      record.lastError = res.error || 'Unknown email delivery error';
      if (record.attempts >= record.maxAttempts) {
        record.status = 'dead_letter';
        record.nextAttemptAt = undefined;
      } else {
        record.status = 'failed';
        const backoffMs = calculateBackoffMs(record.attempts, baseDelayMs);
        record.nextAttemptAt = new Date(now.getTime() + backoffMs).toISOString();
      }
    }

    inMemoryOutbox.set(recordId, record);
    return record;
  }

  const supabase = createAdminClient();
  const table = getOutboxTable(supabase);
  const { data: record, error } = await table
    .select('*')
    .eq('id', recordId)
    .maybeSingle();

  if (error || !record) return null;
  if (record.status === 'sent' || record.status === 'dead_letter') {
    return {
      id: record.id,
      eventType: record.event_type as OutboxRecord['eventType'],
      idempotencyKey: record.idempotency_key,
      recipientEmail: record.recipient_email,
      recipientName: record.recipient_name,
      subject: record.subject,
      htmlContent: record.html_content,
      textContent: record.text_content,
      metadata: (record.metadata as Record<string, unknown>) || {},
      status: record.status,
      attempts: record.attempts,
      maxAttempts: record.max_attempts,
      lastAttemptAt: record.last_attempt_at ?? undefined,
      nextAttemptAt: record.next_attempt_at ?? undefined,
      lastError: record.last_error ?? undefined,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  const res = await provider.sendEmail(
    record.recipient_email,
    record.subject,
    record.html_content,
    record.text_content
  );

  const now = new Date();
  const attempts = record.attempts + 1;
  const lastAttemptAt = now.toISOString();
  let status: NotificationStatus = 'failed';
  let nextAttemptAt: string | null = null;
  let lastError: string | null = null;

  if (res.success) {
    status = 'sent';
  } else {
    lastError = res.error || 'Unknown delivery failure';
    if (attempts >= record.max_attempts) {
      status = 'dead_letter';
    } else {
      status = 'failed';
      const backoffMs = calculateBackoffMs(attempts, baseDelayMs);
      nextAttemptAt = new Date(now.getTime() + backoffMs).toISOString();
    }
  }

  await table
    .update({
      status,
      attempts,
      last_attempt_at: lastAttemptAt,
      next_attempt_at: nextAttemptAt,
      last_error: lastError,
      updated_at: now.toISOString(),
    })
    .eq('id', recordId);

  return {
    id: record.id,
    eventType: record.event_type as OutboxRecord['eventType'],
    idempotencyKey: record.idempotency_key,
    recipientEmail: record.recipient_email,
    recipientName: record.recipient_name,
    subject: record.subject,
    htmlContent: record.html_content,
    textContent: record.text_content,
    metadata: (record.metadata as Record<string, unknown>) || {},
    status,
    attempts,
    maxAttempts: record.max_attempts,
    lastAttemptAt,
    nextAttemptAt: nextAttemptAt ?? undefined,
    lastError: lastError ?? undefined,
    createdAt: record.created_at,
    updatedAt: now.toISOString(),
  };
}

export async function processPendingBatch(
  limit: number = 10,
  provider: IEmailProvider = defaultProvider,
  baseDelayMs: number = 30000
): Promise<{ processed: number; sent: number; failed: number; deadLetter: number }> {
  let processed = 0;
  let sent = 0;
  let failed = 0;
  let deadLetter = 0;

  if (!isLiveSupabase()) {
    const now = new Date().toISOString();
    const candidateIds: string[] = [];

    for (const record of inMemoryOutbox.values()) {
      if (candidateIds.length >= limit) break;
      if (record.status === 'pending') {
        candidateIds.push(record.id);
      } else if (
        record.status === 'failed' &&
        record.nextAttemptAt &&
        record.nextAttemptAt <= now
      ) {
        candidateIds.push(record.id);
      }
    }

    for (const id of candidateIds) {
      const res = await processOutboxRecord(id, provider, baseDelayMs);
      if (res) {
        processed++;
        if (res.status === 'sent') sent++;
        else if (res.status === 'dead_letter') deadLetter++;
        else failed++;
      }
    }

    return { processed, sent, failed, deadLetter };
  }

  const supabase = createAdminClient();
  const table = getOutboxTable(supabase);
  const now = new Date().toISOString();

  const { data: pending } = await table
    .select('id')
    .or(`status.eq.pending,and(status.eq.failed,next_attempt_at.lte.${now})`)
    .limit(limit);

  if (!pending || pending.length === 0) {
    return { processed: 0, sent: 0, failed: 0, deadLetter: 0 };
  }

  for (const row of pending) {
    const res = await processOutboxRecord(row.id, provider, baseDelayMs);
    if (res) {
      processed++;
      if (res.status === 'sent') sent++;
      else if (res.status === 'dead_letter') deadLetter++;
      else failed++;
    }
  }

  return { processed, sent, failed, deadLetter };
}

export async function getOutboxRecord(recordId: string): Promise<OutboxRecord | null> {
  if (!isLiveSupabase()) {
    return inMemoryOutbox.get(recordId) || null;
  }
  const supabase = createAdminClient();
  const table = getOutboxTable(supabase);
  const { data, error } = await table
    .select('*')
    .eq('id', recordId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    eventType: data.event_type as OutboxRecord['eventType'],
    idempotencyKey: data.idempotency_key,
    recipientEmail: data.recipient_email,
    recipientName: data.recipient_name,
    subject: data.subject,
    htmlContent: data.html_content,
    textContent: data.text_content,
    metadata: (data.metadata as Record<string, unknown>) || {},
    status: data.status,
    attempts: data.attempts,
    maxAttempts: data.max_attempts,
    lastAttemptAt: data.last_attempt_at ?? undefined,
    nextAttemptAt: data.next_attempt_at ?? undefined,
    lastError: data.last_error ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
