export type OutcomeTelemetryInfluence = {
  telemetry_posture: "positive" | "neutral" | "negative";
  recommendation: string;
};

export function buildOutcomeTelemetryInfluence(summary: any): OutcomeTelemetryInfluence {
  const avg = Number(summary?.average_learning_weight || 0);
  const misaligned = Number(summary?.alignment_counts?.misaligned || 0);

  if (misaligned > 0 || avg < 0) {
    return {
      telemetry_posture: "negative",
      recommendation: "Prefer inspect-first or stability-first execution until outcome alignment improves."
    };
  }

  if (avg >= 0.75) {
    return {
      telemetry_posture: "positive",
      recommendation: "Outcome telemetry supports broader execution confidence."
    };
  }

  return {
    telemetry_posture: "neutral",
    recommendation: "Continue normal guarded execution while collecting more outcome records."
  };
}
