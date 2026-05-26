export type OperatorFollowthroughEvaluation = {
  alignment: "aligned" | "partial" | "misaligned";
  evaluation_reason: string;
};

export function buildOperatorFollowthroughEvaluation(
  executionMemory: any,
  runtimeOutcome: any
): OperatorFollowthroughEvaluation {

  const expectedPath =
    executionMemory?.expected_operator_path || "unknown";

  const runtimeStatus =
    runtimeOutcome?.runtime_status || "pending";

  if (
    expectedPath === "inspect_before_patch" &&
    runtimeStatus === "success"
  ) {
    return {
      alignment: "aligned",
      evaluation_reason:
        "Inspection-first execution completed successfully."
    };
  }

  if (
    runtimeStatus === "guard_failure"
  ) {
    return {
      alignment: "misaligned",
      evaluation_reason:
        "Guard failure indicates orchestration drift or incomplete execution discipline."
    };
  }

  return {
    alignment: "partial",
    evaluation_reason:
      "Execution outcome exists but full orchestration alignment is still uncertain."
  };
}
