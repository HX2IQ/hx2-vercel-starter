import { buildKgxCombinationSynergyLearning } from "./kgx-combination-synergy-learning";
import { buildKgxContextTags } from "./kgx-context-tags";

function makeCombination(tags: string[]) {
  return Array.from(new Set(tags || []))
    .filter(Boolean)
    .sort()
    .join("+");
}

export async function buildKgxCombinationSynergyInfluence(
  requestText: string
) {
  const context = buildKgxContextTags(requestText);
  const synergy = await buildKgxCombinationSynergyLearning();

  const requestCombination =
    makeCombination(context.tags);

  const match =
    (synergy.rankings || []).find(
      (x: any) =>
        x.context_combination === requestCombination
    ) || null;

  return {
    combination_synergy_influence_active: true,
    request: requestText,
    context_tags: context.tags,
    request_combination: requestCombination,
    found: !!match,
    matched_combination: match?.context_combination || null,
    best_assembly: match?.best_assembly || null,
    synergy_score: match?.synergy_score || 0,
    influence_boost: match
      ? Math.round(Number(match.synergy_score || 0) * 0.15 * 10) / 10
      : 0
  };
}
