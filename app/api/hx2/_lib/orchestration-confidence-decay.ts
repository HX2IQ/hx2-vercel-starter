export type OrchestrationConfidenceDecay = {
  confidence_decay:
    | "none"
    | "moderate"
    | "high";

  adjusted_confidence_posture:
    | "expansion"
    | "guarded"
    | "stabilization";

  decay_reason: string;
};

export function buildOrchestrationConfidenceDecay(
  sprintPackage: any
): OrchestrationConfidenceDecay {

  const restraint =
    sprintPackage?.adaptive_restraint_audit || {};

  const escalation =
    sprintPackage?.verification_escalation || {};

  const recovery =
    sprintPackage?.orchestration_recovery || {};

  if (
    recovery?.recovery_mode === "rebuild"
  ) {
    return {
      confidence_decay: "high",
      adjusted_confidence_posture: "stabilization",
      decay_reason:
        "Recovery rebuild state triggered high confidence decay."
    };
  }

  if (
    restraint?.applied === true ||
    escalation?.escalated === true
  ) {
    return {
      confidence_decay: "moderate",
      adjusted_confidence_posture: "guarded",
      decay_reason:
        "Adaptive restraint or escalation reduced orchestration confidence."
    };
  }

  return {
    confidence_decay: "none",
    adjusted_confidence_posture: "expansion",
    decay_reason:
      "No orchestration decay detected."
  };
}
