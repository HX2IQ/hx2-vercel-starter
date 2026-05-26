export function applyLearningWeightsToConfidence(
  confidence: any,
  weights: any
) {
  const telemetryBias =
    Number(weights?.telemetry_bias || 1);

  const stabilityBias =
    Number(weights?.stability_bias || 1);

  const expansionBias =
    Number(weights?.expansion_bias || 1);

  const baseScore =
    Number(confidence?.confidence_score || 0);

  const weightedScore =
    Number(
      (
        baseScore *
        telemetryBias *
        (
          confidence?.confidence_band === "low"
            ? stabilityBias
            : confidence?.confidence_band === "high"
            ? expansionBias
            : 1
        )
      ).toFixed(2)
    );

  let confidenceBand = confidence?.confidence_band || "low";

  if (weightedScore >= 60) {
    confidenceBand = "high";
  } else if (weightedScore >= 25) {
    confidenceBand = "medium";
  } else {
    confidenceBand = "low";
  }

  return {
    ...confidence,
    confidence_score: weightedScore,
    confidence_band: confidenceBand,
    learning_weights_applied: true,
    learning_weight_audit: {
      telemetry_bias: telemetryBias,
      stability_bias: stabilityBias,
      expansion_bias: expansionBias,
      original_score: baseScore,
      weighted_score: weightedScore
    }
  };
}
