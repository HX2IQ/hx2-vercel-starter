import { buildKgxCombinationFailureIntelligence } from "./kgx-combination-failure-intelligence";
import { buildKgxContextTags } from "./kgx-context-tags";

function makeCombination(tags: string[]) {
  return Array.from(new Set(tags || []))
    .filter(Boolean)
    .sort()
    .join("+");
}

export async function buildKgxCombinationFailureInfluence(
  requestText: string
) {
  const context = buildKgxContextTags(requestText);
  const failure =
    await buildKgxCombinationFailureIntelligence();

  const requestCombination =
    makeCombination(context.tags);

  const match =
    (failure.failures || []).find(
      (x: any) =>
        x.context_combination === requestCombination
    ) || null;

  const failureRisk =
    Number(match?.failure_risk_score || 0);

  return {
    combination_failure_influence_active: true,
    request: requestText,
    context_tags: context.tags,
    request_combination: requestCombination,
    found: !!match,
    matched_combination: match?.context_combination || null,
    best_assembly: match?.best_assembly || null,
    failure_risk_score: failureRisk,
    penalty:
      match
        ? Math.round(failureRisk * 0.15 * 10) / 10
        : 0,
    reason: match
      ? "exact context combination failure risk match found"
      : "no exact context combination failure risk match found"
  };
}
