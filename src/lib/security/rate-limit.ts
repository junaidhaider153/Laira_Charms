import { headers } from "next/headers";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryRateLimitStore = new Map<string, RateLimitRecord>();

export async function getClientIp(): Promise<string> {
  try {
    const headerStore = await headers();
    const forwarded = headerStore.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    const realIp = headerStore.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  } catch {
    // Non-request contexts, background jobs, or unit tests
  }
  return "127.0.0.1";
}

export interface RateLimitOptions {
  keyPrefix: string;
  limit: number;
  windowSeconds: number;
  customIdentifier?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Sliding window rate limit checker per IP address or custom identifier.
 */
export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { keyPrefix, limit, windowSeconds, customIdentifier } = options;
  const ip = customIdentifier || (await getClientIp());
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const existing = memoryRateLimitStore.get(key);

  if (!existing || now >= existing.resetAt) {
    memoryRateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - 1),
      resetInSeconds: windowSeconds,
    };
  }

  if (existing.count >= limit) {
    const resetInSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      success: false,
      limit,
      remaining: 0,
      resetInSeconds,
    };
  }

  existing.count += 1;
  memoryRateLimitStore.set(key, existing);
  const resetInSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - existing.count),
    resetInSeconds,
  };
}

export function clearRateLimits(): void {
  memoryRateLimitStore.clear();
}

