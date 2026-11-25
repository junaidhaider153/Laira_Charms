import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { chatRequestSchema, MAX_CHAT_BODY_BYTES } from "@/lib/ai/schemas";
import {
  buildStoreKnowledgeContext,
  buildStudioSystemPrompt,
} from "@/lib/ai/knowledge";
import {
  getActiveAiChatProvider,
  type IAiChatProvider,
} from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

const AI_REQUEST_TIMEOUT_MS = 25_000;

export interface ChatRouteDependencies {
  provider?: IAiChatProvider;
  rateLimiter?: typeof checkRateLimit;
  knowledgeBuilder?: typeof buildStoreKnowledgeContext;
}

async function resolveIdentifier(request: Request): Promise<string> {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return getClientIp();
}

export function createChatPostHandler(deps?: ChatRouteDependencies) {
  return async function POST(request: Request): Promise<Response> {
    try {
      const contentLengthHeader = request.headers.get("content-length");
      if (contentLengthHeader) {
        const declaredSize = Number(contentLengthHeader);
        if (Number.isFinite(declaredSize) && declaredSize > MAX_CHAT_BODY_BYTES) {
          return NextResponse.json(
            { error: "Request payload is too large." },
            { status: 413 }
          );
        }
      }

      const clientIp = await resolveIdentifier(request);
      const limiter = deps?.rateLimiter ?? checkRateLimit;
      const rateLimit = await limiter({
        keyPrefix: "ai_chat",
        limit: 15,
        windowSeconds: 60,
        customIdentifier: clientIp,
      });

      if (!rateLimit.success) {
        return NextResponse.json(
          {
            error: `You've sent quite a few messages! Please wait ${rateLimit.resetInSeconds}s or switch to Email Inquiry for a direct studio reply.`,
            code: "RATE_LIMITED",
            fallbackToInquiry: true,
            resetInSeconds: rateLimit.resetInSeconds,
          },
          { status: 429 }
        );
      }

      const rawText = await request.text();
      if (Buffer.byteLength(rawText, "utf8") > MAX_CHAT_BODY_BYTES) {
        return NextResponse.json(
          { error: "Request payload exceeds maximum allowed size." },
          { status: 413 }
        );
      }

      let rawBody: unknown;
      try {
        rawBody = JSON.parse(rawText);
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON request body." },
          { status: 400 }
        );
      }

      const parsed = chatRequestSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error:
              parsed.error.errors[0]?.message ||
              "Please send a valid chat message.",
          },
          { status: 400 }
        );
      }

      const provider = deps?.provider ?? getActiveAiChatProvider();
      if (!provider.isConfigured()) {
        return NextResponse.json(
          {
            error:
              "Laira Studio AI Assistant is currently offline. Please switch to Email Inquiry to message our studio team directly.",
            code: "AI_UNAVAILABLE",
            fallbackToInquiry: true,
          },
          { status: 503 }
        );
      }

      const knowledgeBuilder =
        deps?.knowledgeBuilder ?? buildStoreKnowledgeContext;
      const storeKnowledge = await knowledgeBuilder();
      const systemInstruction = buildStudioSystemPrompt(storeKnowledge);

      const timeoutController = new AbortController();
      const timeoutId = setTimeout(
        () => timeoutController.abort(),
        AI_REQUEST_TIMEOUT_MS
      );

      if (request.signal) {
        request.signal.addEventListener(
          "abort",
          () => timeoutController.abort(),
          { once: true }
        );
      }

      const generator = provider.streamReply({
        systemInstruction,
        messages: parsed.data.messages,
        signal: timeoutController.signal,
      });

      const iterator = generator[Symbol.asyncIterator]();

      let firstStep: IteratorResult<string>;
      try {
        firstStep = await iterator.next();
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const safeMsg = err instanceof Error ? err.message : "Provider error";
        console.error("[AI Chat] Failed to start response stream:", safeMsg);
        return NextResponse.json(
          {
            error:
              "Our AI studio helper is temporarily unavailable. Please switch to Email Inquiry for a direct human reply.",
            code: "AI_PROVIDER_ERROR",
            fallbackToInquiry: true,
          },
          { status: 503 }
        );
      }

      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            if (!firstStep.done && firstStep.value) {
              controller.enqueue(encoder.encode(firstStep.value));
            }

            while (true) {
              const nextStep = await iterator.next();
              if (nextStep.done) break;
              if (nextStep.value) {
                controller.enqueue(encoder.encode(nextStep.value));
              }
            }
            controller.close();
          } catch (err: unknown) {
            const safeMsg =
              err instanceof Error ? err.message : "Streaming interrupted";
            console.error("[AI Chat] Stream interrupted:", safeMsg);
            controller.close();
          } finally {
            clearTimeout(timeoutId);
          }
        },
        async cancel() {
          clearTimeout(timeoutId);
          timeoutController.abort();
          if (typeof iterator.return === "function") {
            try {
              await iterator.return();
            } catch {
              // Ignore iterator cleanup errors
            }
          }
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store, no-transform",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (err: unknown) {
      const safeMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("[AI Chat] Unexpected route failure:", safeMsg);
      return NextResponse.json(
        {
          error:
            "Something went wrong with AI Chat. Please switch to Email Inquiry to reach our studio directly.",
          code: "AI_INTERNAL_ERROR",
          fallbackToInquiry: true,
        },
        { status: 500 }
      );
    }
  };
}

export const POST = createChatPostHandler();
