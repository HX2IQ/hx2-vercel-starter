import { NextResponse } from "next/server";
import { buildKgxSimilarContextCombinationMatching } from "../_lib/kgx-similar-context-combination-matching";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const q =
    url.searchParams.get("q") ||
    "";

  const matching =
    await buildKgxSimilarContextCombinationMatching(q);

  return NextResponse.json({
    ok: true,
    kgx_similar_context_combination_matching_active: true,
    matching
  });
}
