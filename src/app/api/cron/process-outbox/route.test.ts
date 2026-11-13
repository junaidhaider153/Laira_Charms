import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";

describe("GET /api/cron/process-outbox", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("rejects unauthorized cron requests when CRON_SECRET is set", async () => {
    process.env.CRON_SECRET = "super_secret_cron_token";

    const request = new Request("https://lairacharms.pk/api/cron/process-outbox", {
      headers: {
        authorization: "Bearer wrong_token",
      },
    });

    const response = await GET(request);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toContain("Unauthorized");
  });

  it("accepts authorized cron request with correct secret", async () => {
    process.env.CRON_SECRET = "super_secret_cron_token";

    const request = new Request("https://lairacharms.pk/api/cron/process-outbox", {
      headers: {
        authorization: "Bearer super_secret_cron_token",
      },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body).toHaveProperty("processed");
    expect(body).toHaveProperty("sent");
  });
});

