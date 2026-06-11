import { buildKgxPredictionRegimeIntelligence } from "./kgx-prediction-regime-intelligence";

export async function buildKgxPredictionRegimeCalibration() {
  const intelligence =
    await buildKgxPredictionRegimeIntelligence();

  const calibrations =
    (intelligence.regimes || []).map((regime: any) => {
      const multiplier =
        regime.outcomes < 3
          ? 1
          : regime.success_rate >= 0.85
            ? 1.15
            : regime.success_rate >= 0.7
              ? 1.05
              : regime.success_rate >= 0.5
                ? 0.95
                : 0.85;

      return {
        regime: regime.regime,
        outcomes: regime.outcomes,
        success_rate: regime.success_rate,
        regime_score: regime.regime_score,
        calibration_multiplier: multiplier,
        calibration_band:
          regime.outcomes < 3
            ? "insufficient_data"
            : multiplier > 1
              ? "positive"
              : multiplier < 1
                ? "negative"
                : "neutral"
      };
    });

  return {
    prediction_regime_calibration_active: true,
    calibration_count: calibrations.length,
    calibrations
  };
}
