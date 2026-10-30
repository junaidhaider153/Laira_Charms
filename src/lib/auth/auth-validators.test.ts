import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth-validators";

describe("Auth Validators", () => {
  describe("loginSchema", () => {
    it("should accept valid credentials", () => {
      const result = loginSchema.safeParse({
        email: "customer@example.com",
        password: "ValidPassword123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "ValidPassword123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password shorter than 8 characters", () => {
      const result = loginSchema.safeParse({
        email: "customer@example.com",
        password: "short",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("should accept valid registration with Pakistani phone", () => {
      const result = registerSchema.safeParse({
        displayName: "Ayesha Khan",
        email: "ayesha@example.pk",
        phone: "03001234567",
        password: "Password123",
        confirmPassword: "Password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject mismatching passwords", () => {
      const result = registerSchema.safeParse({
        displayName: "Ayesha Khan",
        email: "ayesha@example.pk",
        password: "Password123",
        confirmPassword: "DifferentPassword123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
          "Passwords do not match."
        );
      }
    });

    it("should reject weak password missing digits or uppercase", () => {
      const result = registerSchema.safeParse({
        displayName: "Ayesha Khan",
        email: "ayesha@example.pk",
        password: "lowercaseonly",
        confirmPassword: "lowercaseonly",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid Pakistani phone number format", () => {
      const result = registerSchema.safeParse({
        displayName: "Ayesha Khan",
        email: "ayesha@example.pk",
        phone: "12345",
        password: "Password123",
        confirmPassword: "Password123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("should accept valid email", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "registered@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should reject blank or invalid email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("should accept strong confirmed password", () => {
      const result = resetPasswordSchema.safeParse({
        password: "NewSecretPassword1",
        confirmPassword: "NewSecretPassword1",
      });
      expect(result.success).toBe(true);
    });

    it("should reject mismatching reset password", () => {
      const result = resetPasswordSchema.safeParse({
        password: "NewSecretPassword1",
        confirmPassword: "MismatchPassword1",
      });
      expect(result.success).toBe(false);
    });
  });
});

