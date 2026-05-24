export function applyConfidenceDecayToOperatorDecision(
  operatorDecision: any,
  sprintPackage: any
) {
  const decay =
    sprintPackage?.orchestration_confidence_decay || {};

  if (decay?.confidence_decay === "high") {
    return {
      ...operatorDecision,
      decision: "stabilize",
      reason: "High orchestration confidence decay requires stabilization.",
      operator_message:
        "Stop expansion. Stabilize the orchestration path and rerun verification.",
      confidence_decay_override: true
    };
  }

  if (decay?.confidence_decay === "moderate") {
    return {
      ...operatorDecision,
      decision:
        operatorDecision?.decision === "expand"
          ? "proceed"
          : operatorDecision?.decision || "proceed",
      reason: "Moderate confidence decay requires guarded execution.",
      operator_message:
        "Proceed only with guarded scope and stronger verification.",
      confidence_decay_override: true
    };
  }

  return {
    ...operatorDecision,
    confidence_decay_override: false
  };
}
