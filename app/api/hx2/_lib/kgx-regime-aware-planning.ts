import { buildKgxUnifiedStrategicScore } from "./kgx-unified-strategic-score";
import { buildKgxPredictionRegimeCalibration } from "./kgx-prediction-regime-calibration";

export async function buildKgxRegimeAwarePlanning() {
  const score =
    await buildKgxUnifiedStrategicScore();

  const regime =
    await buildKgxPredictionRegimeCalibration();

  return {
    regime_aware_planning_active: true,
    unified_strategic_score:
      score.unified_strategic_score,
    active_regime:
      regime.calibrations?.[0]?.regime || null,
    regime_multiplier:
      regime.calibrations?.[0]?.calibration_multiplier || 1
  };
}
