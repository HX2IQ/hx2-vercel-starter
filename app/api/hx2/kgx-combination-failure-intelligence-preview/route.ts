import { NextResponse } from "next/server";
import { buildKgxCombinationFailureIntelligence } from "../_lib/kgx-combination-failure-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const intelligence =
    await buildKgxCombinationFailureIntelligence();

  return NextResponse.json({
    ok: true,
    kgx_combination_failure_intelligence_active: true,
    intelligence
  });
}
