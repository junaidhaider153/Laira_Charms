import { describe, it, expect } from "vitest";
import { generateGuestToken, verifyGuestToken, hashGuestToken } from "./guest-token";

describe("Guest Token HMAC Security", () => {
  const requestId = "123e4567-e89b-12d3-a456-426614174000";
  const email = "customer@example.com";

  it("generates a valid token and hash pair", () => {
    const { token, hash } = generateGuestToken(requestId, email);

    expect(token).toBeDefined();
    expect(token).toContain(".");
    expect(hash).toBeDefined();
    expect(hash.length).toBe(64); // SHA-256 hex
    expect(hashGuestToken(token)).toBe(hash);
  });

  it("successfully verifies valid token with matching request ID and email", () => {
    const { token } = generateGuestToken(requestId, email);
    const isValid = verifyGuestToken(requestId, email, token);
    expect(isValid).toBe(true);
  });

  it("is case-insensitive and whitespace-tolerant on email verification", () => {
    const { token } = generateGuestToken(requestId, "Customer@Example.COM");
    const isValid = verifyGuestToken(requestId, "  customer@example.com  ", token);
    expect(isValid).toBe(true);
  });

  it("rejects token when request ID does not match", () => {
    const { token } = generateGuestToken(requestId, email);
    const isValid = verifyGuestToken("different-request-id", email, token);
    expect(isValid).toBe(false);
  });

  it("rejects token when email does not match", () => {
    const { token } = generateGuestToken(requestId, email);
    const isValid = verifyGuestToken(requestId, "other@example.com", token);
    expect(isValid).toBe(false);
  });

  it("rejects malformed or empty tokens safely", () => {
    expect(verifyGuestToken(requestId, email, "")).toBe(false);
    expect(verifyGuestToken(requestId, email, "invalid-token-without-dot")).toBe(false);
    expect(verifyGuestToken(requestId, email, "nonce.invalidhex")).toBe(false);
  });
});
