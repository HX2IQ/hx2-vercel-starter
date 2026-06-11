import { buildKgxRuntimeHealthAuthority } from "./kgx-runtime-health-authority";
import { buildKgxCostGuardAuthority } from "./kgx-cost-guard-authority";
import { buildKgxUnifiedRuntimeIntelligence } from "./kgx-unified-runtime-intelligence";
import { buildKgxUnifiedDecisionEngine } from "./kgx-unified-decision-engine";
import { buildKgxUnifiedCalibrationEngine } from "./kgx-unified-calibration-engine";

export async function buildKgxRuntimeTelemetryAuthority() {
  const [
    health,
    costGuard,
    runtime,
    decision,
    calibration
  ] = await Promise.all([
    buildKgxRuntimeHealthAuthority(),
    buildKgxCostGuardAuthority(),
    buildKgxUnifiedRuntimeIntelligence(),
    buildKgxUnifiedDecisionEngine(),
    buildKgxUnifiedCalibrationEngine()
  ]);

  return {
    runtime_telemetry_authority_active: true,
    runtime_requests: 0,
    runtime_health_score:
      health.runtime_health_score,
    execution_allowed:
      costGuard.execution_allowed,
    estimated_cost_band:
      costGuard.estimated_cost_band,
    decision_score:
      decision.decision_score || 0,
    calibration_multiplier:
      calibration.unified_calibration_multiplier || 1,
    telemetry_band:
      health.runtime_health_score >= 85
        ? "healthy"
        : health.runtime_health_score >= 65
          ? "monitor"
          : "attention",
    health,
    costGuard,
    runtime,
    decision,
    calibration
  };
}
