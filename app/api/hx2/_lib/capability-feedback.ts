export type PlannerFeedback = {
  success: boolean;
  quality_score: number;
  feedback_reason: string;
};

export function evaluatePlannerFeedback(
  executionResults: any[],
  executionMode: string
): PlannerFeedback {

  const completed =
    executionResults.filter(
      (r: any) => r.status === "complete"
    ).length;

  const total =
    executionResults.length;

  const ratio =
    total > 0
      ? completed / total
      : 0;

  let quality =
    Number(ratio.toFixed(2));

  if (
    executionMode === "pipeline" &&
    ratio === 1
  ) {
    quality =
      Math.min(
        1,
        Number((quality + 0.1).toFixed(2))
      );
  }

  return {
    success: ratio >= 0.75,
    quality_score: quality,
    feedback_reason:
      ratio === 1
        ? "Full orchestration success."
        : ratio >= 0.75
        ? "Partial orchestration success."
        : "Execution quality below threshold."
  };
}
