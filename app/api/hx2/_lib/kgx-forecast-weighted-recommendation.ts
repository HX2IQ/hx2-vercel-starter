import { buildKgxFusionRecommendation } from "./kgx-fusion-recommendation";
import { buildKgxResourceAllocationIntelligence } from "./kgx-resource-allocation-intelligence";

export async function buildKgxForecastWeightedRecommendation() {
  const recommendation =
    await buildKgxFusionRecommendation();

  const resources =
    await buildKgxResourceAllocationIntelligence();

  return {
    forecast_weighted_recommendation_active: true,
    recommendation:
      resources.allocation_decision === "allocate_resources"
        ? recommendation.recommendation
        : "resource_constrained_review",
    allocation_decision:
      resources.allocation_decision
  };
}
