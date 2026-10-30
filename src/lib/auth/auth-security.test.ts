import { describe, it, expect, vi } from "vitest";
import { forgotPasswordAction } from "./auth-actions";
import { registerSchema } from "./auth-validators";

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    auth: {
      resetPasswordForEmail: vi.fn().mockImplementation((_email: string) => {
        // Supabase returns ok even if user doesn't exist
        return Promise.resolve({ data: {}, error: null });
      }),
    },
  }),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers({ origin: "http://localhost:3000" })),
}));

describe("Auth Security Negative & Privacy Tests", () => {
  describe("AUTH-014: Account Enumeration Prevention", () => {
    it("returns identical generic response whether email exists or not", async () => {
      const formDataExisting = new FormData();
      formDataExisting.append("email", "existing.customer@example.com");

      const resultExisting = await forgotPasswordAction(null, formDataExisting);

      const formDataNonExisting = new FormData();
      formDataNonExisting.append("email", "nonexistent.target@example.com");

      const resultNonExisting = await forgotPasswordAction(null, formDataNonExisting);

      expect(resultExisting.success).toBe(true);
      expect(resultNonExisting.success).toBe(true);
      expect(resultExisting.message).toBe(resultNonExisting.message);
      expect(resultExisting.message).toContain(
        "If an account is associated with that email, instructions to reset your password have been dispatched."
      );
    });
  });

  describe("Role Escalation Prevention", () => {
    it("does not permit self-service admin assignment in registration payload", () => {
      const parsed = registerSchema.safeParse({
        displayName: "Malicious Actor",
        email: "attacker@example.com",
        phone: "03001234567",
        password: "AttackerPassword1",
        confirmPassword: "AttackerPassword1",
        role: "admin", // Attacker attempts to pass admin role
      });

      expect(parsed.success).toBe(true);
      // Ensure the schema strips or ignores unexpected role injection
      if (parsed.success) {
        // @ts-expect-error verifying stripped field
        expect(parsed.data.role).toBeUndefined();
      }
    });
  });

  describe("Password Policy Security", () => {
    it("rejects common weak passwords under 8 characters", () => {
      const short = registerSchema.safeParse({
        displayName: "User",
        email: "user@example.com",
        password: "123",
        confirmPassword: "123",
      });
      expect(short.success).toBe(false);
    });

    it("rejects passwords lacking digits", () => {
      const noDigit = registerSchema.safeParse({
        displayName: "User",
        email: "user@example.com",
        password: "ValidPasswordNoDigit",
        confirmPassword: "ValidPasswordNoDigit",
      });
      expect(noDigit.success).toBe(false);
    });

    it("rejects passwords lacking uppercase letters", () => {
      const noUpper = registerSchema.safeParse({
        displayName: "User",
        email: "user@example.com",
        password: "lowercase12345",
        confirmPassword: "lowercase12345",
      });
      expect(noUpper.success).toBe(false);
    });
  });
});
