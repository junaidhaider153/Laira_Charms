import { describe, it, expect, beforeEach } from 'vitest';
import {
  enqueueNotification,
  processOutboxRecord,
  processPendingBatch,
  getOutboxRecord,
  clearInMemoryOutbox,
  calculateBackoffMs,
  MockFailingEmailProvider,
  ConsoleEmailProvider,
} from './outbox-service';
import { renderEmail } from './email-templates';

describe('Transactional Email Notification Outbox Service (FR-017)', () => {
  beforeEach(() => {
    clearInMemoryOutbox();
  });

  it('calculates exponential backoff correctly', () => {
    // baseDelayMs = 1000
    expect(calculateBackoffMs(1, 1000)).toBe(1000); // 1000 * 2^0
    expect(calculateBackoffMs(2, 1000)).toBe(2000); // 1000 * 2^1
    expect(calculateBackoffMs(3, 1000)).toBe(4000); // 1000 * 2^2
    expect(calculateBackoffMs(4, 1000)).toBe(8000); // 1000 * 2^3
  });

  it('enqueues a new notification safely into pending state', async () => {
    const result = await enqueueNotification({
      recipientEmail: 'ayesha@example.pk',
      recipientName: 'Ayesha Khan',
      eventType: 'order_placed',
      idempotencyKey: 'order_placed_LC-20261101-9999',
      data: {
        orderReference: 'LC-20261101-9999',
        totalPaisa: 250000,
      },
    });

    expect(result.status).toBe('pending');
    expect(result.isDuplicate).toBe(false);
    expect(result.outboxId).toBeDefined();

    const record = await getOutboxRecord(result.outboxId);
    expect(record).not.toBeNull();
    expect(record?.recipientEmail).toBe('ayesha@example.pk');
    expect(record?.subject).toContain('Order Confirmed (LC-20261101-9999)');
    expect(record?.textContent).toContain('PKR 2,500');
    expect(record?.attempts).toBe(0);
  });

  it('enforces idempotency and prevents duplicate notifications', async () => {
    const payload = {
      recipientEmail: 'bilal@example.pk',
      recipientName: 'Bilal Ahmed',
      eventType: 'payment_verified' as const,
      idempotencyKey: 'payment_verified_LC-20261101-8888',
      data: {
        orderReference: 'LC-20261101-8888',
      },
    };

    const first = await enqueueNotification(payload);
    expect(first.isDuplicate).toBe(false);

    const second = await enqueueNotification(payload);
    expect(second.isDuplicate).toBe(true);
    expect(second.outboxId).toBe(first.outboxId);
  });

  it('processes and marks notification as sent upon provider success', async () => {
    const { outboxId } = await enqueueNotification({
      recipientEmail: 'fatima@example.pk',
      recipientName: 'Fatima Noor',
      eventType: 'order_shipped',
      idempotencyKey: 'shipped_LC-20261101-7777',
      data: {
        orderReference: 'LC-20261101-7777',
        courierName: 'TCS Express',
        trackingNumber: 'TCS-99887766',
        trackingUrl: 'https://tcsexpress.com/track/TCS-99887766',
      },
    });

    const processed = await processOutboxRecord(outboxId, new ConsoleEmailProvider());
    expect(processed?.status).toBe('sent');
    expect(processed?.attempts).toBe(1);
    expect(processed?.lastAttemptAt).toBeDefined();
    expect(processed?.lastError).toBeUndefined();
  });

  it('retries with exponential backoff on transient delivery failure', async () => {
    const { outboxId } = await enqueueNotification({
      recipientEmail: 'hassan@example.pk',
      recipientName: 'Hassan Raza',
      eventType: 'quotation_issued',
      idempotencyKey: 'quote_issued_BR-101',
      data: {
        requestReference: 'BR-101',
        quotedAmountPaisa: 420000,
        validUntil: '7 days',
      },
    });

    // Failing provider configured to fail once, then succeed
    const flakyProvider = new MockFailingEmailProvider(1);

    // Attempt 1: should fail
    const attempt1 = await processOutboxRecord(outboxId, flakyProvider, 1000);
    expect(attempt1?.status).toBe('failed');
    expect(attempt1?.attempts).toBe(1);
    expect(attempt1?.nextAttemptAt).toBeDefined();
    expect(attempt1?.lastError).toContain('Simulated SMTP connection timeout');

    // Attempt 2: should succeed
    const attempt2 = await processOutboxRecord(outboxId, flakyProvider, 1000);
    expect(attempt2?.status).toBe('sent');
    expect(attempt2?.attempts).toBe(2);
    expect(attempt2?.lastError).toBeUndefined();
  });

  it('transitions to dead_letter state after exceeding max retries', async () => {
    const { outboxId } = await enqueueNotification({
      recipientEmail: 'zain@example.pk',
      recipientName: 'Zain Malik',
      eventType: 'proof_rejected',
      idempotencyKey: 'proof_rejected_LC-1234',
      data: {
        orderReference: 'LC-1234',
        reason: 'Sender account number does not match receipt.',
      },
    });

    // Always fails
    const deadProvider = new MockFailingEmailProvider(10);

    for (let i = 1; i <= 4; i++) {
      const res = await processOutboxRecord(outboxId, deadProvider, 100);
      expect(res?.status).toBe('failed');
      expect(res?.attempts).toBe(i);
    }

    // 5th attempt (maxAttempts reached)
    const finalAttempt = await processOutboxRecord(outboxId, deadProvider, 100);
    expect(finalAttempt?.status).toBe('dead_letter');
    expect(finalAttempt?.attempts).toBe(5);
    expect(finalAttempt?.nextAttemptAt).toBeUndefined();
  });

  it('processes batches of pending notifications', async () => {
    for (let i = 1; i <= 3; i++) {
      await enqueueNotification({
        recipientEmail: `user${i}@example.pk`,
        recipientName: `User ${i}`,
        eventType: 'guest_access',
        idempotencyKey: `guest_access_${i}`,
        data: { accessUrl: `http://localhost:3000/orders/ref-${i}` },
      });
    }

    const batch = await processPendingBatch(10, new ConsoleEmailProvider());
    expect(batch.processed).toBe(3);
    expect(batch.sent).toBe(3);
    expect(batch.failed).toBe(0);
    expect(batch.deadLetter).toBe(0);
  });

  it('renders all email templates safely without leaking sensitive payment proofs', () => {
    const testCases = [
      { eventType: 'verify_email', data: { verifyUrl: 'http://localhost:3000/auth/verify?token=abc' } },
      { eventType: 'password_reset', data: { resetUrl: 'http://localhost:3000/auth/update-password?token=xyz' } },
      { eventType: 'order_placed', data: { orderReference: 'LC-TEST-1', totalPaisa: 150000 } },
      { eventType: 'proof_received', data: { orderReference: 'LC-TEST-1' } },
      { eventType: 'proof_rejected', data: { orderReference: 'LC-TEST-1', reason: 'Unreadable screenshot.' } },
      { eventType: 'payment_verified', data: { orderReference: 'LC-TEST-1' } },
      { eventType: 'order_in_production', data: { orderReference: 'LC-TEST-1' } },
      {
        eventType: 'order_shipped',
        data: {
          orderReference: 'LC-TEST-1',
          courierName: 'Leopards',
          trackingNumber: 'LEO-12345',
          trackingUrl: 'https://leopardscourier.com/track/LEO-12345',
        },
      },
      { eventType: 'order_delivered', data: { orderReference: 'LC-TEST-1' } },
      { eventType: 'order_cancelled', data: { orderReference: 'LC-TEST-1', reason: 'Cancelled by customer' } },
      {
        eventType: 'quotation_issued',
        data: { requestReference: 'BR-99', quotedAmountPaisa: 300000, validUntil: '2026-11-15' },
      },
      { eventType: 'quotation_expiring', data: { requestReference: 'BR-99' } },
      {
        eventType: 'new_message',
        data: { threadTitle: 'Custom Charm Inquiry', messageSnippet: 'Can we add shimmer glaze?' },
      },
    ] as const;

    for (const tc of testCases) {
      const rendered = renderEmail({
        recipientEmail: 'test@example.pk',
        recipientName: 'Test Customer',
        eventType: tc.eventType,
        idempotencyKey: `test_${tc.eventType}`,
        data: tc.data as Record<string, unknown>,
      });

      expect(rendered.subject).toBeTruthy();
      expect(rendered.htmlContent).toBeTruthy();
      expect(rendered.textContent).toBeTruthy();

      // Ensure no raw private storage bucket URL or proof file name is leaked in email
      expect(rendered.htmlContent).not.toContain('payment-proofs');
      expect(rendered.textContent).not.toContain('payment-proofs');
    }
  });
});

