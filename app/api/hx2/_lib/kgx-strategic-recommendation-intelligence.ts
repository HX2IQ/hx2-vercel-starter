import { buildKgxExpectedValueIntelligence } from "./kgx-expected-value-intelligence";

export async function buildKgxStrategicRecommendationIntelligence() {
  const expectedValue =
    await buildKgxExpectedValueIntelligence();

  return {
    strategic_recommendation_intelligence_active: true,
    recommendation:
      expectedValue.expected_value_band === "high"
        ? "execute"
        : expectedValue.expected_value_band === "moderate"
          ? "review_then_execute"
          : "reassess_plan",
    expected_value: expectedValue.expected_value,
    expected_value_band: expectedValue.expected_value_band
  };
}
