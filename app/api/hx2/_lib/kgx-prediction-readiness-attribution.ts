import { buildKgxPredictionDecisionReadiness } from "./kgx-prediction-decision-readiness";

export async function buildKgxPredictionReadinessAttribution(
  requestText: string
) {
  const readiness =
    await buildKgxPredictionDecisionReadiness(requestText);

  const factors = [
    {
      factor: "trust_score",
      passed: readiness.trust_score >= 65,
      value: readiness.trust_score,
      required: 65
    },
    {
      factor: "risk_band",
      passed: readiness.risk_band !== "high",
      value: readiness.risk_band,
      required: "not high"
    },
    {
      factor: "failure_risk",
      passed: readiness.failure_risk < 0.6,
      value: readiness.failure_risk,
      required: "< 0.6"
    }
  ];

  return {
    prediction_readiness_attribution_active: true,
    request: requestText,
    ready: readiness.ready,
    passed_factors: factors.filter(x => x.passed).length,
    failed_factors: factors.filter(x => !x.passed).length,
    factors,
    readiness
  };
}
