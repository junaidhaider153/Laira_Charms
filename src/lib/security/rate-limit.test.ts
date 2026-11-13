import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, clearRateLimits } from "./rate-limit";

describe("Rate Limiting Service", () => {
  beforeEach(() => {
    clearRateLimits();
  });

  it("permits initial request within limit", async () => {
    const result = await checkRateLimit({
      keyPrefix: "test_action",
      limit: 3,
      windowSeconds: 60,
      customIdentifier: "192.168.1.1",
    });

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.limit).toBe(3);
  });

  it("blocks requests once rate limit threshold is exceeded", async () => {
    const opts = {
      keyPrefix: "login_test",
      limit: 2,
      windowSeconds: 60,
      customIdentifier: "10.0.0.1",
    };

    // 1st request
    const r1 = await checkRateLimit(opts);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(1);

    // 2nd request
    const r2 = await checkRateLimit(opts);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(0);

    // 3rd request should fail
    const r3 = await checkRateLimit(opts);
    expect(r3.success).toBe(false);
    expect(r3.remaining).toBe(0);
    expect(r3.resetInSeconds).toBeGreaterThan(0);
  });

  it("isolates rate limits by IP address", async () => {
    const opts1 = {
      keyPrefix: "chat_test",
      limit: 1,
      windowSeconds: 60,
      customIdentifier: "1.1.1.1",
    };
    const opts2 = {
      keyPrefix: "chat_test",
      limit: 1,
      windowSeconds: 60,
      customIdentifier: "2.2.2.2",
    };

    const user1 = await checkRateLimit(opts1);
    expect(user1.success).toBe(true);

    const user1Second = await checkRateLimit(opts1);
    expect(user1Second.success).toBe(false);

    // User 2 should still be allowed
    const user2 = await checkRateLimit(opts2);
    expect(user2.success).toBe(true);
  });
});

