export function applyLearningWeightStrategyToPackage(
  sprintPackage: any,
  strategy: any
) {
  const posture = strategy?.orchestration_posture || "balanced";
  const scope = strategy?.scope_preference || "moderate";
  const verification = strategy?.verification_intensity || "medium";

  const pkg = { ...sprintPackage };

  if (posture === "stability_first" || scope === "isolated") {
    pkg.files_to_touch = ["single isolated file only"];
  }

  if (scope === "expanded") {
    pkg.files_to_touch = Array.from(
      new Set([...(pkg.files_to_touch || []), "expanded orchestration surface allowed"])
    );
  }

  if (verification === "high") {
    pkg.expected_guards = Array.from(
      new Set([...(pkg.expected_guards || []), "Focused guard before patch", "npm run hx2:quick", "npm run hx2:chat-master:guard"])
    );
  }

  pkg.learning_weight_strategy_audit = {
    orchestration_posture: posture,
    scope_preference: scope,
    verification_intensity: verification,
    modified_fields: ["files_to_touch", "expected_guards"],
    reason: strategy?.strategy_reason || "Learning-weight strategy applied."
  };

  return pkg;
}
