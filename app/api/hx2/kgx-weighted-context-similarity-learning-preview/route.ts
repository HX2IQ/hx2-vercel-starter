import { NextResponse } from "next/server";
import { buildKgxWeightedContextSimilarityLearning } from "../_lib/kgx-weighted-context-similarity-learning";

export const dynamic = "force-dynamic";

export async function GET() {
  const learning = await buildKgxWeightedContextSimilarityLearning();

  return NextResponse.json({
    ok: true,
    kgx_weighted_context_similarity_learning_active: true,
    learning
  });
}
