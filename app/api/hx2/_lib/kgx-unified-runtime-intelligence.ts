import { buildKgxDeepConsumptionIntegration } from "./kgx-deep-consumption-integration";
import { buildKgxUnifiedDecisionEngine } from "./kgx-unified-decision-engine";
import { buildKgxUnifiedCalibrationEngine } from "./kgx-unified-calibration-engine";
import { buildKgxLearningSignalAggregator } from "./kgx-learning-signal-aggregator";
import { buildKgxOutcomeRecordingEngine } from "./kgx-outcome-recording-engine";
import { buildKgxCostGuardAuthority } from "./kgx-cost-guard-authority";

export async function buildKgxUnifiedRuntimeIntelligence() {
  const [
    integration,
    decision,
    calibration,
    learning,
    outcomes,
    costGuard
  ] = await Promise.all([
    buildKgxDeepConsumptionIntegration(),
    buildKgxUnifiedDecisionEngine(),
    buildKgxUnifiedCalibrationEngine(),
    buildKgxLearningSignalAggregator(),
    buildKgxOutcomeRecordingEngine(),
    buildKgxCostGuardAuthority()
  ]);

  const runtimeAuthorityScore =
    Math.round(
      (
        Number(decision.decision_score || 0) * 0.4 +
        Number(calibration.unified_calibration_multiplier || 1) * 30 +
        Number(outcomes.tracked_outcomes || 0) * 0.5
      ) * 10
    ) / 10;

  return {
    unified_runtime_intelligence_active: true,
    cost_guard_execution_allowed:
      costGuard.execution_allowed,
    cost_guard_estimated_cost_band:
      costGuard.estimated_cost_band,
    runtime_readiness:
      runtimeAuthorityScore >= 70
        ? "ready"
        : runtimeAuthorityScore >= 45
          ? "review"
          : "not_ready",
    runtime_authority_score: runtimeAuthorityScore,
    runtime_recommendation:
      decision.decision || "review",
    calibration_band:
      calibration.calibration_band,
    learning_signal_strength:
      learning.learning_signal_strength,
    tracked_outcomes:
      outcomes.tracked_outcomes,
    integration,
    decision,
    calibration,
    learning,
    outcomes,
    costGuard
  };
}

