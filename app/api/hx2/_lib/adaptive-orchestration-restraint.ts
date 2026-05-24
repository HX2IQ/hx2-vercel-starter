export function buildAdaptiveOrchestrationRestraint(sprintPackage: any) {
  const selfAwareness = sprintPackage?.orchestration_self_awareness || {};
  const identity = selfAwareness?.orchestration_identity || "verification";
  const posture = selfAwareness?.adaptive_posture || "guarded";

  if (identity === "recovery") {
    return {
      restraint_mode: "restricted",
      restraint_reason: "Recovery orchestration suppresses expansion behavior.",
      expansion_allowed: false
    };
  }

  if (posture === "guarded") {
    return {
      restraint_mode: "guarded",
      restraint_reason: "Guarded orchestration posture limits expansion.",
      expansion_allowed: false
    };
  }

  return {
    restraint_mode: "none",
    restraint_reason: "Controlled orchestration posture allows expansion.",
    expansion_allowed: true
  };
}
