import { NextResponse } from "next/server";
import { buildKgxContextualAssemblyRecommendation } from "../_lib/kgx-contextual-assembly-recommendation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const q =
    url.searchParams.get("q") ||
    url.searchParams.get("query") ||
    "";

  const recommendation =
    await buildKgxContextualAssemblyRecommendation(q);

  return NextResponse.json({
    ok: true,
    kgx_contextual_assembly_recommendation_active: true,
    recommendation
  });
}
