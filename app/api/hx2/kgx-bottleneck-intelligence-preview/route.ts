import { NextResponse } from "next/server";
import { buildKgxBottleneckIntelligence } from "../_lib/kgx-bottleneck-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const bottleneck =
    await buildKgxBottleneckIntelligence();

  return NextResponse.json({
    ok: true,
    bottleneck_intelligence_active: true,
    bottleneck
  });
}
