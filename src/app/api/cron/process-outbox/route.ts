import { NextResponse } from "next/server";
import { processPendingBatch } from "@/lib/notifications/outbox-service";
import { ResendEmailProvider } from "@/lib/notifications/resend-provider";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron-triggered endpoint that drains the notification outbox daily (midnight UTC).
 * Protected by CRON_SECRET bearer token.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is configured, strictly enforce bearer token match
  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing cron secret" },
        { status: 401 }
      );
    }
  } else if (process.env.NODE_ENV === "production") {
    // In live production, if CRON_SECRET is not configured at all, disallow unprotected trigger
    return NextResponse.json(
      { error: "Server configuration error: CRON_SECRET is not set" },
      { status: 500 }
    );
  }

  const provider = new ResendEmailProvider();
  const result = await processPendingBatch(25, provider);

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    ...result,
  });
}

