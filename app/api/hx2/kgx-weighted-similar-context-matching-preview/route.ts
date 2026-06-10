import { NextResponse } from "next/server";
import { buildKgxWeightedSimilarContextMatching } from "../_lib/kgx-weighted-similar-context-matching";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const q =
    url.searchParams.get("q") ||
    "";

  const matching =
    await buildKgxWeightedSimilarContextMatching(q);

  return NextResponse.json({
    ok: true,
    kgx_weighted_similar_context_matching_active: true,
    matching
  });
}
