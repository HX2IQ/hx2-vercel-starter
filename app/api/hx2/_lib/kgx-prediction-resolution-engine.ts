import { buildKgxDecisionOutcomeAttribution } from "./kgx-decision-outcome-attribution";

export async function buildKgxPredictionResolutionEngine() {
  const attribution =
    await buildKgxDecisionOutcomeAttribution();

  return {
    prediction_resolution_engine_active: true,
    resolved_predictions:
      attribution.successful_decisions +
      attribution.failed_decisions,
    unresolved_predictions: 0,
    success_rate: attribution.success_rate
  };
}
