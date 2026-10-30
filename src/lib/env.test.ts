import { describe, it, expect } from "vitest";
import { env } from "./env";

describe("Environment Configuration & Validation", () => {
  it("should validate and load default environment variables", () => {
    expect(env).toBeDefined();
    expect(env.NEXT_PUBLIC_APP_URL).toBeDefined();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
    expect(env.GUEST_TOKEN_SECRET.length).toBeGreaterThanOrEqual(32);
  });

  it("should have correct default APP_URL format", () => {
    expect(() => new URL(env.NEXT_PUBLIC_APP_URL)).not.toThrow();
  });
});
