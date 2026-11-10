import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isLiveSupabaseConfigured, allowOfflineFallback } from "./offline-mode";

describe("offline-mode detection", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("treats placeholder dummy-project URL as not live", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://dummy-project.supabase.co";
    expect(isLiveSupabaseConfigured()).toBe(false);
  });

  it("treats example.com URL as not live", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.com";
    expect(isLiveSupabaseConfigured()).toBe(false);
  });

  it("treats undefined URL as not live", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(isLiveSupabaseConfigured()).toBe(false);
  });

  it("treats a legitimate Supabase project URL as live", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abcksdjfhlaksdfj.supabase.co";
    expect(isLiveSupabaseConfigured()).toBe(true);
  });

  it("production + placeholder gives allowOfflineFallback() === false", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://dummy-project.supabase.co";
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    expect(allowOfflineFallback()).toBe(false);
  });

  it("development + placeholder gives allowOfflineFallback() === true", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://dummy-project.supabase.co";
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    expect(allowOfflineFallback()).toBe(true);
  });

  it("live Supabase configuration gives allowOfflineFallback() === false regardless of environment", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abcksdjfhlaksdfj.supabase.co";
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    expect(allowOfflineFallback()).toBe(false);
  });
});

