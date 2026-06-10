import { buildKgxCombinationSynergyInfluence } from "./kgx-combination-synergy-influence";
import { buildKgxCombinationFailureInfluence } from "./kgx-combination-failure-influence";

export async function buildKgxNetCombinationInfluence(
  requestText: string
) {
  const synergy =
    await buildKgxCombinationSynergyInfluence(requestText);

  const failure =
    await buildKgxCombinationFailureInfluence(requestText);

  const boost =
    Number(synergy.influence_boost || 0);

  const penalty =
    Number(failure.penalty || 0);

  const netInfluence =
    Math.round((boost - penalty) * 10) / 10;

  return {
    net_combination_influence_active: true,
    request: requestText,
    request_combination:
      synergy.request_combination ||
      failure.request_combination ||
      null,
    synergy_found: synergy.found,
    failure_found: failure.found,
    synergy_boost: boost,
    failure_penalty: penalty,
    net_influence: netInfluence,
    recommended_assembly:
      synergy.best_assembly ||
      failure.best_assembly ||
      null,
    direction:
      netInfluence > 0
        ? "boost"
        : netInfluence < 0
          ? "penalize"
          : "neutral",
    synergy,
    failure
  };
}
