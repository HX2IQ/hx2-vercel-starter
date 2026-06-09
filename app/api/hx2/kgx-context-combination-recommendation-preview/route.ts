import { NextResponse } from "next/server";
import { buildKgxContextCombinationRecommendation } from "../_lib/kgx-context-combination-recommendation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const q =
    url.searchParams.get("q") ||
    url.searchParams.get("query") ||
    "";

  const recommendation =
    await buildKgxContextCombinationRecommendation(q);

  return NextResponse.json({
    ok: true,
    kgx_context_combination_recommendation_active: true,
    recommendation
  });
}
