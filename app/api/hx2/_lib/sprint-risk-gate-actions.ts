export type SprintRiskGateAction = {
  recommended_sequence: string[];
};

export function buildSprintRiskGateActions(
  riskGate: any
): SprintRiskGateAction {

  const gate =
    riskGate?.gate || "unknown";

  if (gate === "inspect_first") {
    return {
      recommended_sequence: [
        "Inspect target file before patching",
        "Run hx2:quick before modifications",
        "Run focused guard before edits",
        "Apply minimal patch",
        "Run hx2:quick after patch"
      ]
    };
  }

  if (gate === "guard_first") {
    return {
      recommended_sequence: [
        "Run focused guard",
        "Apply isolated patch",
        "Run hx2:quick",
        "Run chat-master guard"
      ]
    };
  }

  return {
    recommended_sequence: [
      "Apply sprint patch",
      "Run hx2:quick",
      "Run chat-master guard"
    ]
  };
}
