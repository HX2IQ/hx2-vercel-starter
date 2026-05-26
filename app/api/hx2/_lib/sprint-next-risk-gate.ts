export type SprintNextRiskGate = {
  gate: "proceed" | "guard_first" | "inspect_first";
  reason: string;
};

export function buildSprintNextRiskGate(
  sprintNext: any,
  historySummary: any
): SprintNextRiskGate {
  const buildops =
    sprintNext?.buildops_sprint_plan || {};

  const risk =
    buildops?.risk_level || "unknown";

  const sprintType =
    buildops?.sprint_type || "unknown";

  if (risk === "high") {
    return {
      gate: "inspect_first",
      reason: "High-risk sprint requires inspection before patching."
    };
  }

  if (
    sprintType === "bugfix" ||
    historySummary?.top_failure_node !== "unknown"
  ) {
    return {
      gate: "guard_first",
      reason: "Bugfix or failure history detected; run focused guard before expansion."
    };
  }

  return {
    gate: "proceed",
    reason: "No blocking risk signals detected."
  };
}
