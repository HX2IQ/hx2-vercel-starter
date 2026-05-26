export function applyVerificationSynthesisToPackage(
  sprintPackage: any
) {
  const synthesis =
    sprintPackage?.verification_synthesis || {};

  const stability =
    synthesis?.orchestration_stability || "guarded";

  const pkg = {
    ...sprintPackage
  };

  if (stability === "fragile") {
    pkg.files_to_touch = [
      "single isolated stabilization file only"
    ];

    pkg.expected_guards = Array.from(
      new Set([
        ...(pkg.expected_guards || []),
        "Cross-stage verification synthesis review",
        "Manual stabilization review",
        "npm run hx2:quick",
        "npm run hx2:chat-master:guard"
      ])
    );

    pkg.verification_synthesis_audit = {
      applied: true,
      orchestration_stability: stability,
      reason:
        synthesis?.synthesis_reason ||
        "Verification synthesis required stabilization."
    };

    return pkg;
  }

  pkg.verification_synthesis_audit = {
    applied: false,
    orchestration_stability: stability,
    reason:
      synthesis?.synthesis_reason ||
      "Verification synthesis did not require package changes."
  };

  return pkg;
}
