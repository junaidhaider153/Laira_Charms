import { NextResponse } from "next/server";
import { getShippingPolicySettings } from "@/lib/settings/settings-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getShippingPolicySettings();
  return NextResponse.json(settings);
}
