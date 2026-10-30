import { describe, it, expect, afterEach } from "vitest";
import { createAdminClient } from "./admin";

describe("Supabase Admin Client Security", () => {
  const originalWindow = typeof window !== "undefined" ? window : undefined;

  afterEach(() => {
    if (originalWindow) {
      (globalThis as unknown as { window?: unknown }).window = originalWindow;
    } else {
      delete (globalThis as unknown as { window?: unknown }).window;
    }
  });

  it("should block instantiation if simulated inside a browser window", () => {
    // Simulate browser window
    (globalThis as unknown as { window?: unknown }).window = {};

    expect(() => createAdminClient()).toThrow(
      "SECURITY VIOLATION: createAdminClient cannot be called in browser/client environment"
    );
  });

  it("should instantiate successfully in server environment", () => {
    delete (globalThis as unknown as { window?: unknown }).window;
    const client = createAdminClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });
});
