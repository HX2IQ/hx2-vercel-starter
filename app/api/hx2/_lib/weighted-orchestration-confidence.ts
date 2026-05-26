export type WeightedOrchestrationConfidence = {
  confidence_score: number;
  confidence_band: "low" | "medium" | "high";
  confidence_reason: string;
};

export function buildWeightedOrchestrationConfidence(
  summary: any
): WeightedOrchestrationConfidence {

  const avg =
    Number(summary?.average_learning_weight || 0);

  const aligned =
    Number(summary?.alignment_counts?.aligned || 0);

  const partial =
    Number(summary?.alignment_counts?.partial || 0);

  const misaligned =
    Number(summary?.alignment_counts?.misaligned || 0);

  const score =
    (
      (avg * 50) +
      (aligned * 10) +
      (partial * 3) -
      (misaligned * 15)
    );

  if (score >= 60) {
    return {
      confidence_score: score,
      confidence_band: "high",
      confidence_reason:
        "Telemetry indicates stable orchestration alignment."
    };
  }

  if (score >= 25) {
    return {
      confidence_score: score,
      confidence_band: "medium",
      confidence_reason:
        "Telemetry indicates partially stable orchestration behavior."
    };
  }

  return {
    confidence_score: score,
    confidence_band: "low",
    confidence_reason:
      "Telemetry indicates orchestration instability or insufficient aligned outcomes."
  };
}
