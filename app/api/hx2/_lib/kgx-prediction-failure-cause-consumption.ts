import { buildKgxPredictionFailureCauseIntelligence } from "./kgx-prediction-failure-cause-intelligence";

export async function buildKgxPredictionFailureCauseConsumption() {
  const intelligence =
    await buildKgxPredictionFailureCauseIntelligence();

  const adjustments =
    (intelligence.cause_rankings || [])
      .map((item: any) => {
        const count =
          Number(item.count || 0);

        const penalty =
          Math.round(
            Math.min(count * 5, 25) * 10
          ) / 10;

        return {
          cause: item.cause,
          count,
          penalty,
          action:
            item.cause === "wrong_primary_node"
              ? "reduce_primary_prediction_confidence"
              : item.cause === "wrong_assembly_composition"
                ? "reduce_assembly_composition_confidence"
                : "monitor_failure_pattern"
        };
      });

  return {
    prediction_failure_cause_consumption_active: true,
    failure_count: intelligence.failure_count,
    adjustment_count: adjustments.length,
    adjustments
  };
}
