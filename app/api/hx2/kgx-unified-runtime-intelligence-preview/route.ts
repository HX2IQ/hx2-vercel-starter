import { NextResponse } from "next/server";
import { buildKgxUnifiedRuntimeIntelligence } from "../_lib/kgx-unified-runtime-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const runtime =
    await buildKgxUnifiedRuntimeIntelligence();

  return NextResponse.json({
    ok: true,
    kgx_unified_runtime_intelligence_active: true,
    runtime
  });
}
