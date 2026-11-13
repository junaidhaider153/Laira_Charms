import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isHoneypotClean, verifyTurnstileToken } from "./spam-protection";

describe("Spam Protection & Honeypot", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Honeypot Verification", () => {
    it("considers empty or null honeypot fields clean (human users)", () => {
      expect(isHoneypotClean(null)).toBe(true);
      expect(isHoneypotClean(undefined)).toBe(true);
      expect(isHoneypotClean("")).toBe(true);
      expect(isHoneypotClean("   ")).toBe(true);
    });

    it("flags filled honeypot fields as spam (bots)", () => {
      expect(isHoneypotClean("http://spamsite.xyz")).toBe(false);
      expect(isHoneypotClean("Buy cheap backlinks")).toBe(false);
    });
  });

  describe("Turnstile Token Verification", () => {
    it("passes through when TURNSTILE_SECRET_KEY is not set or dummy (dev/test)", async () => {
      delete process.env.TURNSTILE_SECRET_KEY;
      const res = await verifyTurnstileToken(null);
      expect(res.success).toBe(true);
    });

    it("verifies token with Cloudflare API when secret key is configured", async () => {
      process.env.TURNSTILE_SECRET_KEY = "live_secret_key_12345";
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const res = await verifyTurnstileToken("valid_cf_token", "192.168.1.1");
      expect(res.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    it("rejects when token is invalid or challenge failed", async () => {
      process.env.TURNSTILE_SECRET_KEY = "live_secret_key_12345";
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, "error-codes": ["invalid-input-response"] }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const res = await verifyTurnstileToken("bad_token");
      expect(res.success).toBe(false);
      expect(res.error).toContain("invalid-input-response");
    });
  });
});

