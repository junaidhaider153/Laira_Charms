import { GoogleGenAI } from "@google/genai";
import { allowOfflineFallback } from "@/lib/auth/offline-mode";

export interface AiChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AiChatGenerateOptions {
  systemInstruction: string;
  messages: AiChatTurn[];
  signal?: AbortSignal;
}

export interface IAiChatProvider {
  readonly name: string;
  isConfigured(): boolean;
  streamReply(options: AiChatGenerateOptions): AsyncIterable<string>;
}

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

function resolveApiKey(rawValue: string | undefined): string | undefined {
  const key = rawValue?.trim();
  if (!key || key.startsWith("dummy") || key.includes("your_")) {
    return undefined;
  }
  return key;
}

export function isAiOfflineBlocked(): boolean {
  return allowOfflineFallback() && process.env.AI_ENABLE_IN_OFFLINE !== "true";
}

export class GroqChatProvider implements IAiChatProvider {
  readonly name = "groq";
  private readonly model: string;

  constructor(model?: string) {
    const envModel = process.env.GROQ_CHAT_MODEL?.trim() || process.env.AI_CHAT_MODEL?.trim();
    const usableEnvModel = envModel && !envModel.startsWith("gemini-") ? envModel : undefined;
    this.model = model || usableEnvModel || DEFAULT_GROQ_MODEL;
  }

  isConfigured(): boolean {
    if (isAiOfflineBlocked()) {
      return false;
    }
    return Boolean(resolveApiKey(process.env.GROQ_API_KEY));
  }

  async *streamReply(options: AiChatGenerateOptions): AsyncIterable<string> {
    const apiKey = resolveApiKey(process.env.GROQ_API_KEY);
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured.");
    }

    const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: options.systemInstruction },
          ...options.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        temperature: 0.4,
        max_tokens: 600,
        stream: true,
      }),
      signal: options.signal,
    });

    if (!response.ok) {
      let message = `Groq API error (${response.status})`;
      try {
        const errJson = (await response.json()) as { error?: { message?: string } };
        if (errJson.error?.message) {
          message = `Groq API error (${response.status}): ${errJson.error.message}`;
        }
      } catch {
        // Ignore parse errors on upstream error response
      }
      throw new Error(message);
    }

    if (!response.body) {
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const fallbackText = data.choices?.[0]?.message?.content;
      if (fallbackText) {
        yield fallbackText;
      }
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        if (options.signal?.aborted) {
          break;
        }
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line || !line.startsWith("data:")) {
            continue;
          }
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") {
            continue;
          }
          try {
            const parsed = JSON.parse(payload) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              yield delta;
            }
          } catch {
            // Skip malformed partial SSE lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export class GeminiChatProvider implements IAiChatProvider {
  readonly name = "gemini";
  private readonly model: string;

  constructor(model?: string) {
    const envModel = process.env.AI_CHAT_MODEL?.trim();
    const usableEnvModel =
      envModel && !envModel.startsWith("llama") && !envModel.startsWith("mixtral")
        ? envModel
        : undefined;
    this.model = model || usableEnvModel || DEFAULT_GEMINI_MODEL;
  }

  isConfigured(): boolean {
    if (isAiOfflineBlocked()) {
      return false;
    }
    return Boolean(resolveApiKey(process.env.GEMINI_API_KEY));
  }

  async *streamReply(options: AiChatGenerateOptions): AsyncIterable<string> {
    const apiKey = resolveApiKey(process.env.GEMINI_API_KEY);
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const responseStream = await ai.models.generateContentStream({
      model: this.model,
      contents: options.messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
      config: {
        systemInstruction: options.systemInstruction,
        temperature: 0.4,
        maxOutputTokens: 600,
        abortSignal: options.signal,
      },
    });

    for await (const chunk of responseStream) {
      if (options.signal?.aborted) {
        break;
      }
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }
}

export function getActiveAiChatProvider(): IAiChatProvider {
  const preferred = process.env.AI_CHAT_PROVIDER?.trim().toLowerCase();
  const groq = new GroqChatProvider();
  const gemini = new GeminiChatProvider();

  if (preferred === "gemini") {
    return gemini;
  }
  if (preferred === "groq") {
    return groq;
  }

  if (groq.isConfigured()) {
    return groq;
  }
  if (gemini.isConfigured()) {
    return gemini;
  }
  return resolveApiKey(process.env.GROQ_API_KEY) ? groq : gemini;
}
