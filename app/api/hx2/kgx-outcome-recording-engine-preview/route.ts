import { NextResponse } from "next/server";
import { buildKgxOutcomeRecordingEngine } from "../_lib/kgx-outcome-recording-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const engine =
    await buildKgxOutcomeRecordingEngine();

  return NextResponse.json({
    ok: true,
    outcome_recording_engine_active: true,
    engine
  });
}
