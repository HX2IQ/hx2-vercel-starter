import { buildKgxContextTagCombinationLearning } from "./kgx-context-tag-combination-learning";
import { buildKgxContextTags } from "./kgx-context-tags";

function makeCombination(tags: string[]) {
  return Array.from(new Set(tags || []))
    .filter(Boolean)
    .sort()
    .join("+");
}

function parseAssemblyKey(key: string) {
  return key
    .split("+")
    .map(x => x.trim())
    .filter(Boolean);
}

export async function buildKgxContextCombinationRecommendation(
  requestText: string
) {
  const context = buildKgxContextTags(requestText);
  const learning = await buildKgxContextTagCombinationLearning();

  const requestCombination = makeCombination(context.tags);

  const match =
    (learning.combinations || [])
      .find((x: any) => x.context_combination === requestCombination) ||
    null;

  const nodes =
    match?.best_assembly
      ? parseAssemblyKey(match.best_assembly)
      : [];

  return {
    context_combination_recommendation_active: true,
    request: requestText,
    context_tags: context.tags,
    request_combination: requestCombination,
    found: !!match,
    recommended_assembly: match?.best_assembly || null,
    contextual_effectiveness_score:
      match?.best_contextual_effectiveness_score || 0,
    average_score: match?.best_average_score || 0,
    success_rate: match?.best_success_rate || 0,
    outcomes: match?.best_outcomes || 0,
    recommended_primary: nodes[0] || null,
    recommended_challenge: nodes[1] || null,
    recommended_validation: nodes[2] || null,
    recommended_secondary: nodes[3] || null,
    reason: match
      ? "best assembly for exact context-tag combination"
      : "no exact context-tag combination history found"
  };
}
