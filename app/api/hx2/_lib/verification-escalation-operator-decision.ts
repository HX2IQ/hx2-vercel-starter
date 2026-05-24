export function applyVerificationEscalationToOperatorDecision(
  operatorDecision: any,
  sprintPackage: any
) {
  const escalation =
    sprintPackage?.verification_escalation || {};

  if (escalation?.escalated === true) {
    return {
      ...operatorDecision,
      decision: "stabilize",
      reason: "Verification escalation requires stabilization before expansion.",
      operator_message:
        "Do not expand scope. Stabilize the orchestration path and rerun verification.",
      verification_escalation_override: true
    };
  }

  if (escalation?.escalation_action === "increase_verification") {
    return {
      ...operatorDecision,
      decision:
        operatorDecision?.decision === "expand"
          ? "proceed"
          : operatorDecision?.decision || "proceed",
      reason: "Verification posture requires caution before expansion.",
      operator_message:
        "Proceed only with stronger verification and isolated execution discipline.",
      verification_escalation_override: true
    };
  }

  return {
    ...operatorDecision,
    verification_escalation_override: false
  };
}
