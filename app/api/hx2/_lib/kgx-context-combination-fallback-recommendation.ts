import { buildKgxContextCombinationRecommendation } from "./kgx-context-combination-recommendation";
import { buildKgxSimilarContextCombinationMatching } from "./kgx-similar-context-combination-matching";

function parseAssemblyKey(key: string) {
  return key
    .split("+")
    .map(x => x.trim())
    .filter(Boolean);
}

export async function buildKgxContextCombinationFallbackRecommendation(
  requestText: string
) {
  const exact =
    await buildKgxContextCombinationRecommendation(requestText);

  if (exact.found) {
    return {
      context_combination_fallback_recommendation_active: true,
      source: "exact_context_combination",
      ...exact
    };
  }

  const similar =
    await buildKgxSimilarContextCombinationMatching(requestText);

  const bestSimilar =
    (similar.matches || [])
      .filter((x: any) => x.best_assembly)
      .sort(
        (a: any, b: any) =>
          b.similarity_score -
          a.similarity_score
      )[0] || null;

  const nodes =
    bestSimilar?.best_assembly
      ? parseAssemblyKey(bestSimilar.best_assembly)
      : [];

  return {
    context_combination_fallback_recommendation_active: true,
    source: bestSimilar
      ? "similar_context_combination"
      : "no_context_combination_match",
    request: requestText,
    context_tags: similar.request_tags || exact.context_tags || [],
    request_combination: exact.request_combination,
    found: !!bestSimilar,
    matched_combination: bestSimilar?.context_combination || null,
    similarity_score: bestSimilar?.similarity_score || 0,
    recommended_assembly: bestSimilar?.best_assembly || null,
    contextual_effectiveness_score:
      bestSimilar?.best_contextual_effectiveness_score || 0,
    average_score: bestSimilar?.best_average_score || 0,
    success_rate: bestSimilar?.best_success_rate || 0,
    outcomes: bestSimilar?.best_outcomes || 0,
    recommended_primary: nodes[0] || null,
    recommended_challenge: nodes[1] || null,
    recommended_validation: nodes[2] || null,
    recommended_secondary: nodes[3] || null,
    reason: bestSimilar
      ? "no exact context combination found; used nearest similar context combination"
      : "no exact or similar context combination history found"
  };
}
