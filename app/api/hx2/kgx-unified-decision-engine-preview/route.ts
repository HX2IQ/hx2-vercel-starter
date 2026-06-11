import { NextResponse } from "next/server";
import { buildKgxUnifiedDecisionEngine } from "../_lib/kgx-unified-decision-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const decision =
    await buildKgxUnifiedDecisionEngine();

  return NextResponse.json({
    ok: true,
    kgx_unified_decision_engine_active: true,
    decision
  });
}
