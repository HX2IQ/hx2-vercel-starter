import { NextResponse } from "next/server";
import { buildKgxExecutionPathIntelligence } from "../_lib/kgx-execution-path-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const path =
    await buildKgxExecutionPathIntelligence();

  return NextResponse.json({
    ok: true,
    execution_path_intelligence_active: true,
    path
  });
}
