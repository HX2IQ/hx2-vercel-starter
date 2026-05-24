export type OrchestrationSelfAwareness = {
  orchestration_identity:
    | "expansion"
    | "stabilization"
    | "verification"
    | "recovery";

  orchestration_state_reason: string;

  adaptive_posture:
    | "controlled"
    | "guarded"
    | "fragile";
};

export function buildOrchestrationSelfAwareness(
  sprintPackage: any
): OrchestrationSelfAwareness {

  const synthesis =
    sprintPackage?.verification_synthesis || {};

  const escalation =
    sprintPackage?.verification_escalation || {};

  const recovery =
    sprintPackage?.orchestration_recovery || {};

  const stability =
    synthesis?.orchestration_stability || "guarded";

  if (
    recovery?.recovery_mode === "rebuild"
  ) {
    return {
      orchestration_identity: "recovery",
      orchestration_state_reason:
        "Recovery layer detected orchestration rebuild state.",
      adaptive_posture: "fragile"
    };
  }

  if (
    escalation?.escalated === true
  ) {
    return {
      orchestration_identity: "stabilization",
      orchestration_state_reason:
        "Verification escalation triggered stabilization state.",
      adaptive_posture: "guarded"
    };
  }

  if (
    stability === "guarded"
  ) {
    return {
      orchestration_identity: "verification",
      orchestration_state_reason:
        "Cross-stage verification synthesis requires guarded orchestration.",
      adaptive_posture: "guarded"
    };
  }

  return {
    orchestration_identity: "expansion",
    orchestration_state_reason:
      "Orchestration layers aligned for controlled expansion.",
    adaptive_posture: "controlled"
  };
}
