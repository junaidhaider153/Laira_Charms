import crypto from "crypto";

function getSecret(): string {
  return process.env.GUEST_TOKEN_SECRET || "laira-charms-secure-guest-hmac-secret-min-32-chars";
}

/**
 * Generates a cryptographically secure HMAC guest access token and its storage hash.
 */
export function generateGuestToken(
  requestId: string,
  email: string
): { token: string; hash: string } {
  const nonce = crypto.randomBytes(16).toString("hex");
  const normalizedEmail = email.toLowerCase().trim();
  const data = `${requestId}:${normalizedEmail}:${nonce}`;
  const signature = crypto.createHmac("sha256", getSecret()).update(data).digest("hex");

  const token = `${nonce}.${signature}`;
  const hash = crypto.createHash("sha256").update(token).digest("hex");

  return { token, hash };
}

/**
 * Verifies a guest access token using timing-safe comparison.
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
  if (parts.length !== 2) {
    return false;
  }

  const [nonce, signature] = parts;
  if (!nonce || !signature) {
    return false;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const data = `${requestId}:${normalizedEmail}:${nonce}`;
  const expectedSignature = crypto.createHmac("sha256", getSecret()).update(data).digest("hex");

  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

/**
 * Computes SHA-256 hash of a guest token for database comparison against `guest_token_hash`.
 */
export function hashGuestToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
