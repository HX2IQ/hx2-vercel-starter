import { buildKgxPredictiveCalibrationIntelligence } from "./kgx-predictive-calibration-intelligence";
import { buildKgxPredictiveStabilityIntelligence } from "./kgx-predictive-stability-intelligence";
import { buildKgxPredictionFailureRiskIntelligence } from "./kgx-prediction-failure-risk-intelligence";

export async function buildKgxPredictionTrustIntelligence(
  requestText: string
) {
  const calibration =
    await buildKgxPredictiveCalibrationIntelligence();

  const stability =
    await buildKgxPredictiveStabilityIntelligence();

  const risk =
    await buildKgxPredictionFailureRiskIntelligence(requestText);

  const accuracyScore =
    Number(calibration.prediction_accuracy || 0) * 100;

  const calibrationScore =
    Number(calibration.confidence_multiplier || 1) * 80;

  const stabilityScore =
    Number(stability.stability_score || 0);

  const riskPenalty =
    Number(risk.failure_risk || 0) * 100;

  const trustScore =
    Math.round(
      Math.max(
        0,
        Math.min(
          100,
          accuracyScore * 0.35 +
          calibrationScore * 0.25 +
          stabilityScore * 0.25 -
          riskPenalty * 0.15
        )
      ) * 10
    ) / 10;

  const trustBand =
    trustScore >= 85
      ? "high"
      : trustScore >= 65
        ? "moderate"
        : trustScore >= 40
          ? "low"
          : "poor";

  return {
    prediction_trust_intelligence_active: true,
    request: requestText,
    predicted_assembly: risk.predicted_assembly,
    trust_score: trustScore,
    trust_band: trustBand,
    accuracy_score:
      Math.round(accuracyScore * 10) / 10,
    calibration_score:
      Math.round(calibrationScore * 10) / 10,
    stability_score: stabilityScore,
    failure_risk: risk.failure_risk,
    risk_band: risk.risk_band,
    source_signals: {
      calibration,
      stability,
      risk
    },
    reason:
      trustBand === "high"
        ? "prediction has strong accuracy, calibration, and stability signals"
        : trustBand === "moderate"
          ? "prediction has usable but not dominant trust signals"
          : "prediction trust is limited by weak accuracy, instability, or failure risk"
  };
}
