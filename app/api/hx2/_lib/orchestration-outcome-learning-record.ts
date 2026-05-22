export type OrchestrationOutcomeLearningRecord = {
  execution_id: string;
  runtime_status: string;
  alignment: string;
  completed_guard_count: number;
  learning_weight: number;
  learning_summary: string;
};

export function buildOrchestrationOutcomeLearningRecord(
  runtimeOutcome: any,
  followthroughEvaluation: any
): OrchestrationOutcomeLearningRecord {

  const completedGuardCount =
    Array.isArray(runtimeOutcome?.completed_guards)
      ? runtimeOutcome.completed_guards.length
      : 0;

  const alignment =
    followthroughEvaluation?.alignment || "partial";

  const learningWeight =
    alignment === "aligned"
      ? 1
      : alignment === "partial"
      ? 0.5
      : -1;

  return {
    execution_id: runtimeOutcome?.execution_id || "unknown",
    runtime_status: runtimeOutcome?.runtime_status || "pending",
    alignment,
    completed_guard_count: completedGuardCount,
    learning_weight: learningWeight,
    learning_summary:
      `Outcome ${alignment} with ${completedGuardCount} completed guards.`
  };
}
