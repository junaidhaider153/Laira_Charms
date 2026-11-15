import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { adminReviewPaymentAction } from "./actions";

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
});
