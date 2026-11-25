import { z } from "zod";

const envSchema = z.object({
  // Public variables accessible in browser
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default("https://dummy-project.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default("dummy-anon-key-for-development"),

  // Server-only variables (never exposed to NEXT_PUBLIC_* or browser bundle)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).default("dummy-service-role-key-for-server-only"),
  SUPABASE_DB_URL: z.string().optional(),
  RESEND_API_KEY: z.string().min(1).default("re_dummy_mock_key_for_testing"),
  GMAIL_USER: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  EMAIL_PROVIDER: z.enum(["auto", "gmail", "resend", "console"]).default("auto"),
  EMAIL_FROM: z.string().min(1).default("Laira Charms <no-reply@lairacharms.pk>"),
  GUEST_TOKEN_SECRET: z.string().min(32, "GUEST_TOKEN_SECRET must be at least 32 characters long").default("laira-charms-secure-guest-hmac-secret-min-32-chars"),
  ADMIN_BOOTSTRAP_TOKEN: z.string().min(1).default("laira-admin-bootstrap-dev-token-only"),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  AI_CHAT_PROVIDER: z.enum(["auto", "groq", "gemini"]).default("auto"),
  AI_CHAT_MODEL: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    EMAIL_FROM: process.env.EMAIL_FROM,
    GUEST_TOKEN_SECRET: process.env.GUEST_TOKEN_SECRET,
    ADMIN_BOOTSTRAP_TOKEN: process.env.ADMIN_BOOTSTRAP_TOKEN,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    AI_CHAT_PROVIDER: process.env.AI_CHAT_PROVIDER,
    AI_CHAT_MODEL: process.env.AI_CHAT_MODEL,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables. See console logs for details.");
  }

  if (parsed.data.NODE_ENV === "production") {
    const rawSecret = process.env.GUEST_TOKEN_SECRET;
    if (!rawSecret || rawSecret === "laira-charms-secure-guest-hmac-secret-min-32-chars") {
      throw new Error(
        "Production configuration error: GUEST_TOKEN_SECRET must be explicitly set with a unique secure secret."
      );
    }
  }

  return parsed.data;
}

export const env = validateEnv();

