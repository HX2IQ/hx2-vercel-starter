import { buildKgxUnifiedDecisionEngine } from "./kgx-unified-decision-engine";
import { buildKgxUnifiedCalibrationEngine } from "./kgx-unified-calibration-engine";
import { buildKgxCostGuardAuthority } from "./kgx-cost-guard-authority";
import { buildKgxUnifiedRuntimeIntelligence } from "./kgx-unified-runtime-intelligence";

export async function buildKgxRuntimeHealthAuthority() {
  const [
    decision,
    calibration,
    costGuard,
    runtime
  ] = await Promise.all([
    buildKgxUnifiedDecisionEngine(),
    buildKgxUnifiedCalibrationEngine(),
    buildKgxCostGuardAuthority(),
    buildKgxUnifiedRuntimeIntelligence()
  ]);

  const healthScore =
    Math.round(
      (
        (decision.decision_score || 75) * 0.35 +
        (runtime.runtime_authority_score || 75) * 0.35 +
        ((costGuard.execution_allowed ? 100 : 50) * 0.15) +
        ((calibration.unified_calibration_multiplier || 1) * 100 * 0.15)
      ) * 10
    ) / 10;

  return {
    runtime_health_authority_active: true,
    runtime_health_score: healthScore,
    runtime_health_band:
      healthScore >= 85
        ? "healthy"
        : healthScore >= 65
          ? "monitor"
          : "attention",
    decision_health:
      (decision.decision_score || 0) >= 70
        ? "healthy"
        : "monitor",
    calibration_health:
      (calibration.unified_calibration_multiplier || 1) >= 0.9
        ? "healthy"
        : "monitor",
    cost_health:
      costGuard.execution_allowed
        ? "healthy"
        : "restricted",
    system_ready:
      healthScore >= 65,
    decision,
    calibration,
    costGuard,
    runtime
  };
}
