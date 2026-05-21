export type Dev2OperatorDecision = {
  decision: "proceed" | "inspect" | "stabilize" | "expand";
  reason: string;
  operator_message: string;
};

export function buildDev2OperatorDecision(
  sprintPackage: any
): Dev2OperatorDecision {
  const gate = sprintPackage?.risk_gate || "unknown";
  const audit = sprintPackage?.adaptive_modification_audit || {};
  const strategy = audit?.strategy || "stability_first";

  if (gate === "inspect_first") {
    return {
      decision: "inspect",
      reason: "Risk gate requires inspection before patching.",
      operator_message: "Inspect target files first. Do not patch until current structure is mapped."
    };
  }

  if (strategy === "stability_first") {
    return {
      decision: "stabilize",
      reason: "Adaptive strategy selected stability-first execution.",
      operator_message: "Use a small isolated patch and focused guard before expansion."
    };
  }

  if (strategy === "expansion_ready") {
    return {
      decision: "expand",
      reason: "Adaptive strategy indicates the system can handle broader orchestration work.",
      operator_message: "Proceed with a larger intelligence-building sprint, but still run quick verify."
    };
  }

  return {
    decision: "proceed",
    reason: "No blocking risk signals detected.",
    operator_message: "Proceed with normal isolated sprint workflow."
  };
}
