import { buildKgxPredictiveAccuracyTracking } from "./kgx-predictive-accuracy-tracking";

function movingWindowAccuracy(history: any[], start: number, size: number) {
  const window =
    history.slice(start, start + size);

  if (!window.length) {
    return null;
  }

  return window.filter(x => x.correct).length / window.length;
}

export async function buildKgxPredictiveStabilityIntelligence() {
  const tracking =
    await buildKgxPredictiveAccuracyTracking();

  const history =
    Array.isArray(tracking.prediction_history)
      ? tracking.prediction_history
      : [];

  const windowSize = 5;
  const windows: any[] = [];

  for (let i = 0; i < history.length; i += windowSize) {
    const accuracy =
      movingWindowAccuracy(history, i, windowSize);

    if (accuracy === null) {
      continue;
    }

    windows.push({
      window_index: windows.length + 1,
      start_index: i,
      sample_count:
        history.slice(i, i + windowSize).length,
      accuracy:
        Math.round(accuracy * 1000) / 1000
    });
  }

  const accuracies =
    windows.map(x => x.accuracy);

  const mean =
    accuracies.length > 0
      ? accuracies.reduce((a, b) => a + b, 0) /
        accuracies.length
      : 0;

  const variance =
    accuracies.length > 0
      ? accuracies.reduce(
          (sum, value) =>
            sum + Math.pow(value - mean, 2),
          0
        ) / accuracies.length
      : 0;

  const stabilityScore =
    Math.round(
      Math.max(0, 100 - variance * 100) * 10
    ) / 10;

  const stabilityState =
    history.length < 10
      ? "insufficient_history"
      : stabilityScore >= 90
        ? "stable"
        : stabilityScore >= 70
          ? "moderately_stable"
          : "volatile";

  return {
    predictive_stability_intelligence_active: true,
    total_predictions: history.length,
    window_size: windowSize,
    window_count: windows.length,
    mean_window_accuracy:
      Math.round(mean * 1000) / 1000,
    accuracy_variance:
      Math.round(variance * 1000) / 1000,
    stability_score: stabilityScore,
    stability_state: stabilityState,
    windows
  };
}
