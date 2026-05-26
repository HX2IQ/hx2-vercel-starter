export type OrchestrationExecutionMemory = {
  execution_id: string;
  timestamp: string;
  feature_name: string;
  operator_decision: string;
  adaptive_strategy: string;
  expected_operator_path: string;
  expected_guards: string[];
};

function buildExecutionId() {
  return `exec_${Date.now()}`;
}

export function buildOrchestrationExecutionMemory(
  sprintPackage: any
): OrchestrationExecutionMemory {

  const operatorDecision =
    sprintPackage?.operator_decision || {};

  const adaptiveAudit =
    sprintPackage?.adaptive_modification_audit || {};

  const followthrough =
    sprintPackage?.operator_followthrough || {};

  return {
    execution_id:
      buildExecutionId(),

    timestamp:
      new Date().toISOString(),

    feature_name:
      sprintPackage?.feature_name || "unknown",

    operator_decision:
      operatorDecision?.decision || "unknown",

    adaptive_strategy:
      adaptiveAudit?.strategy || "unknown",

    expected_operator_path:
      followthrough?.expected_operator_path || "unknown",

    expected_guards:
      sprintPackage?.expected_guards || []
  };
}
