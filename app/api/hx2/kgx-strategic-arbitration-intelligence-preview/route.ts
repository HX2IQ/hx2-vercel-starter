import { NextResponse } from "next/server";
import { buildKgxStrategicArbitrationIntelligence } from "../_lib/kgx-strategic-arbitration-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const arbitration =
    await buildKgxStrategicArbitrationIntelligence();

  return NextResponse.json({
    ok: true,
    strategic_arbitration_intelligence_active: true,
    arbitration
  });
}
