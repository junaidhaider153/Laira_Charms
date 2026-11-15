import crypto from "crypto";

function getSecret(): string {
  const secret = process.env.GUEST_TOKEN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL SECURITY ERROR: GUEST_TOKEN_SECRET environment variable is missing in production."
      );
    }
    return "laira-charms-secure-guest-hmac-secret-min-32-chars";
  }
  if (
    process.env.NODE_ENV === "production" &&
    secret === "laira-charms-secure-guest-hmac-secret-min-32-chars"
  ) {
    throw new Error(
      "CRITICAL SECURITY ERROR: Default GUEST_TOKEN_SECRET cannot be used in production."
    );
  }
  return secret;
}

/**
 * Default token expiration duration: 30 days in milliseconds.
 */
export const DEFAULT_GUEST_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Generates a cryptographically secure HMAC guest access token with an expiration timestamp and storage hash.
 */
export function generateGuestToken(
  requestId: string,
  email: string,
  expiresInMs: number = DEFAULT_GUEST_TOKEN_TTL_MS
): { token: string; hash: string; expiresAt: number } {
  const nonce = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + expiresInMs;
  const normalizedEmail = email.toLowerCase().trim();
  const data = `${requestId}:${normalizedEmail}:${nonce}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", getSecret()).update(data).digest("hex");

  const token = `${nonce}.${expiresAt}.${signature}`;
  const hash = crypto.createHash("sha256").update(token).digest("hex");

  return { token, hash, expiresAt };
}

/**
 * Verifies a guest access token using timing-safe comparison and checks token expiration.
 */
export function verifyGuestToken(
  requestId: string,
  email: string,
  token: string
): boolean {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return false;
  }

  const parts = token.split(".");
  const normalizedEmail = email.toLowerCase().trim();

  // 3-part token: nonce.expiresAt.signature
  if (parts.length === 3) {
    const [nonce, expiresAtStr, signature] = parts;
    if (!nonce || !expiresAtStr || !signature) {
      return false;
    }

    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return false; // Token has expired
    }

    const data = `${requestId}:${normalizedEmail}:${nonce}:${expiresAt}`;
    let expectedSignature: string;
    try {
      expectedSignature = crypto.createHmac("sha256", getSecret()).update(data).digest("hex");
    } catch {
      return false;
    }

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  }

  // 2-part token: nonce.signature (backward compatibility in development/tests)
  if (parts.length === 2) {
    const [nonce, signature] = parts;
    if (!nonce || !signature) {
      return false;
    }

    const data = `${requestId}:${normalizedEmail}:${nonce}`;
    let expectedSignature: string;
    try {
      expectedSignature = crypto.createHmac("sha256", getSecret()).update(data).digest("hex");
    } catch {
      return false;
    }

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  }

  return false;
}

/**
 * Computes SHA-256 hash of a guest token for database comparison against `guest_token_hash`.
 */
export function hashGuestToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
