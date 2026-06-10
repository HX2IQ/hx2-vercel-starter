import { buildKgxRoutingDecisionOutcomeAttribution } from "./kgx-routing-decision-outcome-attribution";
import { buildKgxNetCombinationInfluence } from "./kgx-net-combination-influence";
import { buildKgxAssemblyEffectiveness } from "./kgx-assembly-effectiveness";
import { buildKgxPredictiveCalibrationIntelligence } from "./kgx-predictive-calibration-intelligence";

function parseAssemblyKey(key: string) {
  return String(key || "")
    .split("+")
    .map(x => x.trim())
    .filter(Boolean);
}

export async function buildKgxPredictiveAssemblySelection(
  requestText: string
) {
  const routingAttribution =
    await buildKgxRoutingDecisionOutcomeAttribution();

  const netInfluence =
    await buildKgxNetCombinationInfluence(requestText);

  const assemblyEffectiveness =
    await buildKgxAssemblyEffectiveness();

  const predictiveCalibration =
    await buildKgxPredictiveCalibrationIntelligence();

  const candidates: Record<string, any> = {};

  for (const item of routingAttribution.attributions || []) {
    const key = item.assembly_key || "unknown";

    candidates[key] = {
      assembly_key: key,
      routing_decision_score: Number(item.routing_decision_score || 0),
      effectiveness_score: 0,
      net_influence: 0,
      predictive_score: 0
    };
  }

  for (const item of assemblyEffectiveness.rankings || []) {
    const key = item.assembly_key || "unknown";

    if (!candidates[key]) {
      candidates[key] = {
        assembly_key: key,
        routing_decision_score: 0,
        effectiveness_score: 0,
        net_influence: 0,
        predictive_score: 0
      };
    }

    candidates[key].effectiveness_score =
      Number(item.effectiveness_score || 0);
  }

  if (netInfluence.recommended_assembly) {
    const key = netInfluence.recommended_assembly;

    if (!candidates[key]) {
      candidates[key] = {
        assembly_key: key,
        routing_decision_score: 0,
        effectiveness_score: 0,
        net_influence: 0,
        predictive_score: 0
      };
    }

    candidates[key].net_influence =
      Number(netInfluence.net_influence || 0);
  }

  const predictions =
    Object.values(candidates)
      .map((x: any) => {
        const rawPredictiveScore =
          (
            x.routing_decision_score * 0.45 +
            x.effectiveness_score * 0.4 +
            x.net_influence * 0.15
          );

        const predictiveScore =
          Math.round(
            rawPredictiveScore *
            Number(predictiveCalibration.confidence_multiplier || 1) *
            10
          ) / 10;

        const nodes = parseAssemblyKey(x.assembly_key);

        return {
          ...x,
          raw_predictive_score:
            Math.round(rawPredictiveScore * 10) / 10,
          predictive_score: predictiveScore,
          calibration_multiplier:
            predictiveCalibration.confidence_multiplier || 1,
          calibration_band:
            predictiveCalibration.calibration_band || "unknown",
          recommended_primary: nodes[0] || null,
          recommended_challenge: nodes[1] || null,
          recommended_validation: nodes[2] || null,
          recommended_secondary: nodes[3] || null
        };
      })
      .sort(
        (a: any, b: any) =>
          b.predictive_score - a.predictive_score
      );

  return {
    predictive_assembly_selection_active: true,
    request: requestText,
    prediction_count: predictions.length,
    predicted_assembly: predictions[0]?.assembly_key || null,
    predicted_score: predictions[0]?.predictive_score || 0,
    predictions,
    source_signals: {
      routing_decision_attribution_active:
        routingAttribution.routing_decision_outcome_attribution_active,
      net_combination_influence_active:
        netInfluence.net_combination_influence_active,
      assembly_effectiveness_active:
        assemblyEffectiveness.assembly_effectiveness_active,
      predictive_calibration_intelligence_active:
        predictiveCalibration.predictive_calibration_intelligence_active,
      calibration_band:
        predictiveCalibration.calibration_band,
      confidence_multiplier:
        predictiveCalibration.confidence_multiplier
    }
  };
}

