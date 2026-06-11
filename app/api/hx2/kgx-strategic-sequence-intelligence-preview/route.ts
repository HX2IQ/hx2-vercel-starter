import { NextResponse } from "next/server";
import { buildKgxStrategicSequenceIntelligence } from "../_lib/kgx-strategic-sequence-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const sequence =
    await buildKgxStrategicSequenceIntelligence();

  return NextResponse.json({
    ok: true,
    strategic_sequence_intelligence_active: true,
    sequence
  });
}
