import { buildKgxPredictionFailureCauseIntelligence } from "./kgx-prediction-failure-cause-intelligence";
import { buildKgxPredictiveAssemblySelection } from "./kgx-predictive-assembly-selection";

export async function buildKgxPredictionFailureRiskIntelligence(
  requestText: string
) {
  const prediction =
    await buildKgxPredictiveAssemblySelection(requestText);

  const failureCauses =
    await buildKgxPredictionFailureCauseIntelligence();

  const predictedAssembly =
    prediction.predicted_assembly || null;

  const relevantCauses =
    (failureCauses.causes || [])
      .filter((x: any) =>
        predictedAssembly &&
        x.predicted_assembly === predictedAssembly
      );

  const minimumSamples = 5;

  const sampleBase =
    Math.max(prediction.prediction_count || 0, relevantCauses.length);

  const rawFailureRisk =
    sampleBase > 0
      ? relevantCauses.length / sampleBase
      : 0;

  const riskConfidence =
    sampleBase >= minimumSamples
      ? 1
      : Math.round((sampleBase / minimumSamples) * 100) / 100;

  const failureRisk =
    Math.round(rawFailureRisk * riskConfidence * 1000) / 1000;

  const riskBand =
    riskConfidence < 1
      ? "low_confidence"
      : failureRisk >= 0.6
        ? "high"
        : failureRisk >= 0.3
          ? "medium"
          : "low";

  const causeCounts: Record<string, number> = {};

  for (const item of relevantCauses) {
    causeCounts[item.cause] =
      (causeCounts[item.cause] || 0) + 1;
  }

  const rankedCauses =
    Object.entries(causeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cause, count]) => ({
        cause,
        count
      }));

  return {
    prediction_failure_risk_intelligence_active: true,
    request: requestText,
    predicted_assembly: predictedAssembly,
    predicted_score: prediction.predicted_score || 0,
    relevant_failure_count: relevantCauses.length,
    minimum_samples: minimumSamples,
    sample_base: sampleBase,
    raw_failure_risk:
      Math.round(rawFailureRisk * 1000) / 1000,
    risk_confidence: riskConfidence,
    failure_risk: failureRisk,
    risk_band: riskBand,
    primary_risk_cause: rankedCauses[0]?.cause || null,
    ranked_causes: rankedCauses,
    reason:
      relevantCauses.length > 0
        ? "historical prediction failures matched predicted assembly"
        : "no historical prediction failures matched predicted assembly"
  };
}

