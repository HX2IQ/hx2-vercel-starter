import { buildKgxPredictionFailureCauseConsumption } from "./kgx-prediction-failure-cause-consumption";

export async function buildKgxPredictionFailureCauseInfluence() {
  const consumption =
    await buildKgxPredictionFailureCauseConsumption();

  const influence =
    (consumption.adjustments || [])
      .map((item: any) => {
        const penalty =
          Number(item.penalty || 0);

        return {
          cause: item.cause,
          count: item.count,
          action: item.action,
          penalty,
          influence_weight:
            Math.round(
              Math.min(penalty / 25, 1) * 100
            ) / 100,
          routing_effect:
            item.action === "reduce_primary_prediction_confidence"
              ? "primary_node_penalty"
              : item.action === "reduce_assembly_composition_confidence"
                ? "assembly_composition_penalty"
                : "monitor_only"
        };
      });

  return {
    prediction_failure_cause_influence_active: true,
    failure_count: consumption.failure_count,
    influence_count: influence.length,
    influence
  };
}
