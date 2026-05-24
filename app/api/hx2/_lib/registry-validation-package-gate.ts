export function applyRegistryValidationGateToPackage(
  sprintPackage: any,
  registryValidation: any
) {
  const pkg = { ...sprintPackage };

  if (registryValidation?.registry_valid === false) {
    pkg.files_to_touch = ["registry stabilization only"];

    pkg.expected_guards = Array.from(
      new Set([
        ...(pkg.expected_guards || []),
        "Registry validation review",
        "npm run hx2:quick",
        "npm run hx2:chat-master:guard"
      ])
    );

    pkg.registry_validation_gate = {
      applied: true,
      reason: "Stage registry validation failed.",
      missing_stage_types: registryValidation?.missing_stage_types || [],
      duplicate_helpers: registryValidation?.duplicate_helpers || []
    };

    return pkg;
  }

  pkg.registry_validation_gate = {
    applied: false,
    reason: "Stage registry validation passed.",
    missing_stage_types: [],
    duplicate_helpers: []
  };

  return pkg;
}
