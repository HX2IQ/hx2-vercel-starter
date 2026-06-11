import { buildKgxStrategicRecommendationIntelligence } from "./kgx-strategic-recommendation-intelligence";

export async function buildKgxResourceRequirementIntelligence() {
  const recommendation =
    await buildKgxStrategicRecommendationIntelligence();

  const resourceUnits =
    recommendation.expected_value >= 60
      ? 8
      : recommendation.expected_value >= 40
        ? 5
        : 3;

  return {
    resource_requirement_intelligence_active: true,
    recommendation: recommendation.recommendation,
    resource_units_required: resourceUnits,
    estimated_effort_band:
      resourceUnits >= 8
        ? "high"
        : resourceUnits >= 5
          ? "medium"
          : "low"
  };
}
