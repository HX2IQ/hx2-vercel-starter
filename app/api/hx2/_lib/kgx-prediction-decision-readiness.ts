import { buildKgxPredictionTrustExplanation } from "./kgx-prediction-trust-explanation";
import { buildKgxPredictionFailureRiskIntelligence } from "./kgx-prediction-failure-risk-intelligence";

export async function buildKgxPredictionDecisionReadiness(
  requestText: string
) {
  const explanation =
    await buildKgxPredictionTrustExplanation(requestText);

  const risk =
    await buildKgxPredictionFailureRiskIntelligence(requestText);

  const ready =
    explanation.trust_score >= 65 &&
    risk.risk_band !== "high";

  return {
    prediction_decision_readiness_active: true,
    request: requestText,
    ready,
    trust_score: explanation.trust_score,
    trust_band: explanation.trust_band,
    risk_band: risk.risk_band,
    failure_risk: risk.failure_risk,
    recommendation: ready
      ? "prediction is ready for routing consumption"
      : "prediction should require stronger challenge or validation before routing",
    explanation,
    risk
  };
}
