export type OrchestrationRecoveryRecommendation = {
  recovery_mode:
    | "none"
    | "stabilize"
    | "rebuild"
    | "verify_only";

  recovery_reason: string;

  recommended_steps: string[];
};

export function buildOrchestrationRecoveryRecommendation(
  sprintPackage: any
): OrchestrationRecoveryRecommendation {

  const synthesis =
    sprintPackage?.verification_synthesis || {};

  const escalation =
    sprintPackage?.verification_escalation || {};

  const trust =
    sprintPackage?.verification_trust_posture || {};

  const stability =
    synthesis?.orchestration_stability || "guarded";

  const trustPosture =
    trust?.trust_posture || "caution";

  if (
    stability === "fragile" &&
    escalation?.escalated === true
  ) {
    return {
      recovery_mode: "rebuild",
      recovery_reason:
        "Fragile orchestration with escalation requires rebuild discipline.",
      recommended_steps: [
        "Isolate orchestration stage",
        "Reduce scope",
        "Run focused verification",
        "Rebuild single orchestration path",
        "Re-run quick verify"
      ]
    };
  }

  if (
    trustPosture === "caution"
  ) {
    return {
      recovery_mode: "stabilize",
      recovery_reason:
        "Verification posture requires stabilization before expansion.",
      recommended_steps: [
        "Increase verification",
        "Use isolated execution",
        "Avoid multi-file mutation",
        "Re-run orchestration verification"
      ]
    };
  }

  if (
    stability === "stable"
  ) {
    return {
      recovery_mode: "none",
      recovery_reason:
        "Orchestration stability is aligned.",
      recommended_steps: [
        "Proceed with controlled execution"
      ]
    };
  }

  return {
    recovery_mode: "verify_only",
    recovery_reason:
      "Additional verification recommended before execution.",
    recommended_steps: [
      "Run quick verify",
      "Run focused orchestration guards"
    ]
  };
}
