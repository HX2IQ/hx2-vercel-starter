import { buildKgxPredictiveAccuracyTracking } from "./kgx-predictive-accuracy-tracking";

function accuracyFor(history: any[]) {
  if (!history.length) {
    return 0;
  }

  return history.filter(x => x.correct).length / history.length;
}

export async function buildKgxPredictionHorizonIntelligence() {
  const tracking =
    await buildKgxPredictiveAccuracyTracking();

  const history =
    Array.isArray(tracking.prediction_history)
      ? tracking.prediction_history
      : [];

  const shortTerm =
    history.slice(0, 10);

  const mediumTerm =
    history.slice(0, 50);

  const longTerm =
    history;

  const shortAccuracy =
    accuracyFor(shortTerm);

  const mediumAccuracy =
    accuracyFor(mediumTerm);

  const longAccuracy =
    accuracyFor(longTerm);

  const horizonDelta =
    Math.round(
      (shortAccuracy - longAccuracy) * 1000
    ) / 1000;

  const horizonState =
    history.length < 10
      ? "insufficient_history"
      : horizonDelta > 0.1
        ? "short_term_outperforming"
        : horizonDelta < -0.1
          ? "short_term_underperforming"
          : "aligned";

  return {
    prediction_horizon_intelligence_active: true,
    total_predictions: history.length,
    short_term: {
      window: 10,
      samples: shortTerm.length,
      accuracy: Math.round(shortAccuracy * 1000) / 1000
    },
    medium_term: {
      window: 50,
      samples: mediumTerm.length,
      accuracy: Math.round(mediumAccuracy * 1000) / 1000
    },
    long_term: {
      window: "all",
      samples: longTerm.length,
      accuracy: Math.round(longAccuracy * 1000) / 1000
    },
    horizon_delta: horizonDelta,
    horizon_state: horizonState
  };
}
