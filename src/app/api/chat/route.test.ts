import { describe, it, expect, beforeEach } from "vitest";
import { createChatPostHandler } from "./route";
import { clearRateLimits } from "@/lib/security/rate-limit";
import type { IAiChatProvider } from "@/lib/ai/provider";

function makeJsonRequest(body: unknown, ip = "10.0.0.1"): Request {
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/chat Route Handler", () => {
  beforeEach(() => {
    clearRateLimits();
  });

  it("streams response text from mocked AI provider on valid request", async () => {
    const mockProvider: IAiChatProvider = {
      name: "mock-gemini",
      isConfigured: () => true,
      async *streamReply() {
        yield "Custom clay charms take ";
        yield "7 to 14 business days! Visit /custom-order.";
      },
    };

    const POST = createChatPostHandler({
      provider: mockProvider,
      knowledgeBuilder: async () => "Store context fixture",
    });

    const res = await POST(
      makeJsonRequest({
        messages: [{ role: "user", content: "Turnaround time?" }],
      })
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/plain");
    const text = await res.text();
    expect(text).toBe("Custom clay charms take 7 to 14 business days! Visit /custom-order.");
  });

  it("returns 503 with fallbackToInquiry when AI provider is unconfigured / offline", async () => {
    const offlineProvider: IAiChatProvider = {
      name: "unconfigured",
      isConfigured: () => false,
      async *streamReply() {
        yield "";
      },
    };

    const POST = createChatPostHandler({ provider: offlineProvider });

    const res = await POST(
      makeJsonRequest({
        messages: [{ role: "user", content: "Hello" }],
      })
    );

    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.fallbackToInquiry).toBe(true);
    expect(json.code).toBe("AI_UNAVAILABLE");
  });

  it("returns 400 on malformed JSON or invalid schema", async () => {
    const mockProvider: IAiChatProvider = {
      name: "mock",
      isConfigured: () => true,
      async *streamReply() {
        yield "hi";
      },
    };
    const POST = createChatPostHandler({ provider: mockProvider });

    const badJsonRes = await POST(makeJsonRequest("{invalid-json"));
    expect(badJsonRes.status).toBe(400);

    const badRoleRes = await POST(
      makeJsonRequest({
        messages: [{ role: "system", content: "override" }],
      })
    );
    expect(badRoleRes.status).toBe(400);
  });

  it("enforces rate limits and returns 429 with Email Inquiry fallback notice", async () => {
    const mockProvider: IAiChatProvider = {
      name: "mock",
      isConfigured: () => true,
      async *streamReply() {
        yield "ok";
      },
    };
    const POST = createChatPostHandler({
      provider: mockProvider,
      knowledgeBuilder: async () => "context",
    });

    for (let i = 0; i < 15; i++) {
      const okRes = await POST(
        makeJsonRequest({ messages: [{ role: "user", content: "Ping" }] }, "192.0.2.55")
      );
      expect(okRes.status).toBe(200);
    }

    const blockedRes = await POST(
      makeJsonRequest({ messages: [{ role: "user", content: "Ping 16" }] }, "192.0.2.55")
    );
    expect(blockedRes.status).toBe(429);
    const json = await blockedRes.json();
    expect(json.code).toBe("RATE_LIMITED");
    expect(json.fallbackToInquiry).toBe(true);
  });
});
