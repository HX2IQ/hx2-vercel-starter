import { buildKgxPredictionRegimeAttribution } from "./kgx-prediction-regime-attribution";
import { buildKgxPredictionRegimeCalibration } from "./kgx-prediction-regime-calibration";

export async function buildKgxPredictionRegimeSummary() {
  const attribution =
    await buildKgxPredictionRegimeAttribution();

  const calibration =
    await buildKgxPredictionRegimeCalibration();

  return {
    prediction_regime_summary_active: true,
    top_regime: attribution.top_regime,
    weakest_regime: attribution.weakest_regime,
    calibration_count: calibration.calibration_count,
    summary:
      `Top regime: ${attribution.top_regime || "none"}. ` +
      `Weakest regime: ${attribution.weakest_regime || "none"}.`,
    attribution,
    calibration
  };
}
