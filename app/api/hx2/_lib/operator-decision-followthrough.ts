export type OperatorDecisionFollowthrough = {
  expected_operator_path: string;
  learning_message: string;
};

export function buildOperatorDecisionFollowthrough(
  operatorDecision: any
): OperatorDecisionFollowthrough {

  const decision =
    operatorDecision?.decision || "proceed";

  if (decision === "inspect") {
    return {
      expected_operator_path:
        "inspect_before_patch",

      learning_message:
        "HX2 expects inspection-first workflow before modifications."
    };
  }

  if (decision === "stabilize") {
    return {
      expected_operator_path:
        "stability_first_patch",

      learning_message:
        "HX2 expects isolated patching and focused verification."
    };
  }

  if (decision === "expand") {
    return {
      expected_operator_path:
        "expanded_execution",

      learning_message:
        "HX2 expects broader orchestration execution with reduced restrictions."
    };
  }

  return {
    expected_operator_path:
      "standard_execution",

    learning_message:
      "HX2 expects normal guarded sprint execution."
  };
}
