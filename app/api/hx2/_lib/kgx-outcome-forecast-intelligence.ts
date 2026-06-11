import { buildKgxStrategicRecommendationIntelligence } from "./kgx-strategic-recommendation-intelligence";

export async function buildKgxOutcomeForecastIntelligence() {
  const recommendation =
    await buildKgxStrategicRecommendationIntelligence();

  const forecastProbability =
    recommendation.expected_value_band === "high"
      ? 0.85
      : recommendation.expected_value_band === "moderate"
        ? 0.65
        : 0.40;

  return {
    outcome_forecast_intelligence_active: true,
    recommendation: recommendation.recommendation,
    expected_value: recommendation.expected_value,
    forecast_probability: forecastProbability,
    forecast_band:
      forecastProbability >= 0.8
        ? "strong"
        : forecastProbability >= 0.6
          ? "moderate"
          : "weak"
  };
}
