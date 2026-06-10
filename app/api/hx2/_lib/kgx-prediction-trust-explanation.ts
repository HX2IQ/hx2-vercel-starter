import { buildKgxPredictionTrustAttributionIntelligence } from "./kgx-prediction-trust-attribution-intelligence";

export async function buildKgxPredictionTrustExplanation(
  requestText: string
) {
  const attribution =
    await buildKgxPredictionTrustAttributionIntelligence(requestText);

  return {
    prediction_trust_explanation_active: true,
    request: requestText,
    trust_score: attribution.trust_score,
    trust_band: attribution.trust_band,
    largest_positive_factor: attribution.largest_positive_factor,
    largest_negative_factor: attribution.largest_negative_factor,
    explanation:
      `Prediction trust is ${attribution.trust_band} with score ${attribution.trust_score}. ` +
      `Strongest positive factor: ${attribution.largest_positive_factor || "none"}. ` +
      `Largest negative factor: ${attribution.largest_negative_factor || "none"}.`,
    ranked_factors: attribution.ranked_factors
  };
}
