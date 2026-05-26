export type OrchestrationRuntimeOutcome = {
  execution_id: string;
  runtime_status: "pending" | "success" | "guard_failure";
  completed_guards: string[];
  completion_timestamp: string;
};

export function buildOrchestrationRuntimeOutcome(
  executionMemory: any
): OrchestrationRuntimeOutcome {

  return {
    execution_id:
      executionMemory?.execution_id || "unknown",

    runtime_status:
      "pending",

    completed_guards: [],

    completion_timestamp:
      new Date().toISOString()
  };
}
