import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolveActor } from "./actions";

describe("Messaging security - resolveActor role enforcement", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("live env + no user + isAdminAction: true gives role: 'customer'", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://liveproject.supabase.co";

    // Mock createServerSupabaseClient returning no user
    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: vi.fn().mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      }),
    }));

    const actor = await resolveActor("guest-token-abc", true);
    expect(actor.role).toBe("customer");
    expect(actor.userId).toBeNull();
    expect(actor.guestToken).toBe("guest-token-abc");
  });

  it("live env + auth lookup throws gives role: 'customer'", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://liveproject.supabase.co";

    vi.doMock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: vi.fn().mockRejectedValue(new Error("Network auth error")),
    }));

    const actor = await resolveActor(null, true);
    expect(actor.role).toBe("customer");
    expect(actor.userId).toBeNull();
  });

  it("production + placeholder keys gives role: 'customer' (denies admin elevation)", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://dummy-project.supabase.co";
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";

    const actor = await resolveActor(null, true);
    expect(actor.role).toBe("customer");
    expect(actor.userId).toBeNull();
  });

  it("dev + placeholder keys allows admin dev fallback when requested", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://dummy-project.supabase.co";
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";

    const actor = await resolveActor(null, true);
    expect(actor.role).toBe("admin");
    expect(actor.userId).toBe("admin-dev-fallback");
  });
});

