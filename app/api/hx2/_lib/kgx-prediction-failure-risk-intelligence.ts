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

  const failureRisk =
    prediction.prediction_count > 0
      ? Math.round(
          (
            relevantCauses.length /
            Math.max(prediction.prediction_count, 1)
          ) * 1000
        ) / 1000
      : 0;

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
    failure_risk: failureRisk,
    primary_risk_cause: rankedCauses[0]?.cause || null,
    ranked_causes: rankedCauses,
    reason:
      relevantCauses.length > 0
        ? "historical prediction failures matched predicted assembly"
        : "no historical prediction failures matched predicted assembly"
  };
}
