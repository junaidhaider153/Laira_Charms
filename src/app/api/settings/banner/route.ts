import { NextResponse } from "next/server";
import { getBannerSettings } from "@/lib/settings/settings-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const banner = await getBannerSettings();
  return NextResponse.json(banner);
}

