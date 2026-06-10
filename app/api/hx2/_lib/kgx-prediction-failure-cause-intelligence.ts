import { buildKgxPredictiveAccuracyTracking } from "./kgx-predictive-accuracy-tracking";

export async function buildKgxPredictionFailureCauseIntelligence() {
  const tracking =
    await buildKgxPredictiveAccuracyTracking();

  const history =
    Array.isArray(tracking.prediction_history)
      ? tracking.prediction_history
      : [];

  const failures =
    history.filter(
      x => x.correct === false
    );

  const causes = failures.map(failure => {
    const predicted =
      String(failure.predicted_assembly || "");

    const actual =
      String(failure.actual_assembly || "");

    let cause =
      "unknown";

    if (
      predicted.split(" + ")[0] !==
      actual.split(" + ")[0]
    ) {
      cause = "wrong_primary_node";
    } else if (
      predicted !== actual
    ) {
      cause = "wrong_assembly_composition";
    }

    return {
      predicted_assembly: predicted,
      actual_assembly: actual,
      cause,
      createdAt: failure.createdAt
    };
  });

  const counts: Record<string, number> = {};

  for (const item of causes) {
    counts[item.cause] =
      (counts[item.cause] || 0) + 1;
  }

  return {
    prediction_failure_cause_intelligence_active: true,
    failure_count: failures.length,
    causes,
    cause_rankings: Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([cause, count]) => ({
        cause,
        count
      }))
  };
}
