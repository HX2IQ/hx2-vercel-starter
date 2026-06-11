import { NextResponse } from "next/server";
import { buildKgxUnifiedStrategicScore } from "../_lib/kgx-unified-strategic-score";

export const dynamic = "force-dynamic";

export async function GET() {
  const score =
    await buildKgxUnifiedStrategicScore();

  return NextResponse.json({
    ok: true,
    unified_strategic_score_active: true,
    score
  });
}
