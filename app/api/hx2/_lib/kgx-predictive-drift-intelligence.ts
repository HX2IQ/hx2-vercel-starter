import { buildKgxPredictiveAccuracyTracking } from "./kgx-predictive-accuracy-tracking";

export async function buildKgxPredictiveDriftIntelligence() {
  const tracking =
    await buildKgxPredictiveAccuracyTracking();

  const history =
    Array.isArray(tracking.prediction_history)
      ? tracking.prediction_history
      : [];

  const recent =
    history.slice(0, 10);

  const older =
    history.slice(10, 20);

  const recentAccuracy =
    recent.length > 0
      ? recent.filter(x => x.correct).length /
        recent.length
      : 0;

  const olderAccuracy =
    older.length > 0
      ? older.filter(x => x.correct).length /
        older.length
      : 0;

  const driftDelta =
    Math.round(
      (recentAccuracy - olderAccuracy) * 1000
    ) / 1000;

  const driftState =
    older.length === 0
      ? "insufficient_history"
      : driftDelta > 0.1
        ? "improving"
        : driftDelta < -0.1
          ? "degrading"
          : "stable";

  return {
    predictive_drift_intelligence_active: true,
    recent_accuracy:
      Math.round(recentAccuracy * 1000) / 1000,
    historical_accuracy:
      Math.round(olderAccuracy * 1000) / 1000,
    drift_delta: driftDelta,
    drift_state: driftState,
    recent_samples: recent.length,
    historical_samples: older.length
  };
}
