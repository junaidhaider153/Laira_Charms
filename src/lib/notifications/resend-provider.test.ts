import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ResendEmailProvider } from "./resend-provider";

describe("ResendEmailProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns mock success when using dummy key in non-production", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const provider = new ResendEmailProvider({ apiKey: "re_dummy_test_key" });
    const result = await provider.sendEmail(
      "test@example.pk",
      "Order Placed",
      "<p>Thank you</p>",
      "Thank you"
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toContain("mock_resend_");
  });

  it("fails in production when API key is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const provider = new ResendEmailProvider({ apiKey: "" });
    const result = await provider.sendEmail(
      "test@example.pk",
      "Order Placed",
      "<p>Thank you</p>",
      "Thank you"
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("RESEND_API_KEY is not configured");
  });

  it("sends request to Resend API when valid key is provided", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "msg_live_resend_12345" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const provider = new ResendEmailProvider({
      apiKey: "re_live_real_key",
      fromEmail: "orders@lairacharms.pk",
    });

    const result = await provider.sendEmail(
      "customer@example.pk",
      "Your Keepsake is Ready",
      "<p>Shipped!</p>",
      "Shipped!"
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBe("msg_live_resend_12345");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer re_live_real_key",
          "Content-Type": "application/json",
        },
      })
    );
  });

  it("handles Resend API error responses gracefully", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      json: async () => ({ message: "Domain not verified on Resend" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const provider = new ResendEmailProvider({ apiKey: "re_live_real_key" });
    const result = await provider.sendEmail(
      "customer@example.pk",
      "Subject",
      "<p>Hi</p>",
      "Hi"
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("Domain not verified on Resend");
  });
});
