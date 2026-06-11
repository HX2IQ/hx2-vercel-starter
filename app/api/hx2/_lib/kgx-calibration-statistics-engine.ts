import { buildKgxDecisionCalibrationFeedback } from "./kgx-decision-calibration-feedback";

export async function buildKgxCalibrationStatisticsEngine() {
  const feedback =
    await buildKgxDecisionCalibrationFeedback();

  return {
    calibration_statistics_engine_active: true,
    calibration_multiplier:
      feedback.calibration_multiplier,
    success_rate:
      feedback.success_rate,
    average_score:
      feedback.average_score,
    calibration_band:
      feedback.calibration_band
  };
}
