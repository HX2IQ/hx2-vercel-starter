import { buildKgxPredictionTrustIntelligence } from "./kgx-prediction-trust-intelligence";

export async function buildKgxPredictionTrustAttributionIntelligence(
  requestText: string
) {
  const trust =
    await buildKgxPredictionTrustIntelligence(requestText);

  const factors = [
    {
      factor: "accuracy",
      contribution:
        Math.round(
          Number(trust.accuracy_score || 0) * 0.35 * 10
        ) / 10
    },
    {
      factor: "calibration",
      contribution:
        Math.round(
          Number(trust.calibration_score || 0) * 0.25 * 10
        ) / 10
    },
    {
      factor: "stability",
      contribution:
        Math.round(
          Number(trust.stability_score || 0) * 0.25 * 10
        ) / 10
    },
    {
      factor: "failure_risk",
      contribution:
        Math.round(
          Number(trust.failure_risk || 0) * -15 * 10
        ) / 10
    }
  ];

  const ranked =
    [...factors].sort(
      (a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)
    );

  return {
    prediction_trust_attribution_intelligence_active: true,
    request: requestText,
    trust_score: trust.trust_score,
    trust_band: trust.trust_band,
    largest_positive_factor:
      factors
        .filter(x => x.contribution > 0)
        .sort((a,b)=>b.contribution-a.contribution)[0]?.factor || null,
    largest_negative_factor:
      factors
        .filter(x => x.contribution < 0)
        .sort((a,b)=>a.contribution-b.contribution)[0]?.factor || null,
    factors,
    ranked_factors: ranked
  };
}
