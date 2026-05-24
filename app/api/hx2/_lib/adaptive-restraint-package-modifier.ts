export function applyAdaptiveRestraintToPackage(
  sprintPackage: any
) {
  const restraint =
    sprintPackage?.adaptive_orchestration_restraint || {};

  const pkg = { ...sprintPackage };

  if (restraint?.expansion_allowed === false) {
    pkg.files_to_touch = [
      "single isolated file only"
    ];

    pkg.expected_guards = Array.from(
      new Set([
        ...(pkg.expected_guards || []),
        "Adaptive restraint review",
        "No expansion until restraint clears",
        "npm run hx2:quick"
      ])
    );

    pkg.adaptive_restraint_audit = {
      applied: true,
      restraint_mode: restraint?.restraint_mode || "guarded",
      reason: restraint?.restraint_reason || "Expansion restrained by orchestration state."
    };

    return pkg;
  }

  pkg.adaptive_restraint_audit = {
    applied: false,
    restraint_mode: restraint?.restraint_mode || "none",
    reason: restraint?.restraint_reason || "No restraint required."
  };

  return pkg;
}
