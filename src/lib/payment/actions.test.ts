import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { adminReviewPaymentAction, getPaymentProofSignedUrlAction, submitPaymentProofAction } from "./actions";

describe("Payment Actions Fail-Closed Guard (C-04)", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://dummy-project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "dummy-anon-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails closed in production when unauthenticated without falling back to admin-dev-fallback", async () => {
    const result = await adminReviewPaymentAction({
      paymentId: "123e4567-e89b-12d3-a456-426614174000",
      action: "verify",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Unauthorized\. Admin authentication required\./i);
  });

  it("rejects invalid review actions cleanly", async () => {
    const result = await adminReviewPaymentAction({
      paymentId: "123e4567-e89b-12d3-a456-426614174000",
      action: "reject",
      rejectionReason: "no", // Less than 5 characters
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/rejection reason/i);
  });

  it("generates signed url or safe preview in offline mode", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const result = await getPaymentProofSignedUrlAction("payment-proofs/test-order/screenshot.png");
    expect(result.success).toBe(true);
    expect(result.signedUrl).toBeDefined();
  });

  it("rejects invalid file formats when submitting payment proof", async () => {
    const fd = new FormData();
    fd.append("orderReference", "LC-20261115-001");
    fd.append("methodId", "meezan");
    fd.append("senderName", "Test Sender");
    fd.append("transactionId", "TXN123456");
    const fakeFile = new File(["dummy content"], "test.exe", { type: "application/x-msdownload" });
    fd.append("proofFile", fakeFile);

    const result = await submitPaymentProofAction(null, fd);
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Invalid file format/i);
  });
});
