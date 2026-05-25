export function applyPhase3DiagnosticsGate(
  sprintPackage: any,
  diagnostics: any
) {
  const pkg = { ...sprintPackage };

  const manifestOk =
    diagnostics?.manifest_health?.manifest_ok === true;

  const registryValid =
    diagnostics?.registry_validation?.registry_valid === true;

  const lineageValid =
    diagnostics?.execution_lineage_integrity?.lineage_valid === true;

  if (!manifestOk || !registryValid || !lineageValid) {
    pkg.files_to_touch = ["phase 3 orchestration stabilization only"];

    pkg.expected_guards = Array.from(
      new Set([
        ...(pkg.expected_guards || []),
        "Phase 3 diagnostics review",
        "Registry validation review",
        "Execution lineage integrity review",
        "npm run hx2:quick",
        "npm run hx2:chat-master:guard"
      ])
    );

    pkg.phase3_diagnostics_gate = {
      applied: true,
      manifest_ok: manifestOk,
      registry_valid: registryValid,
      lineage_valid: lineageValid,
      reason:
        "Phase 3 diagnostics detected orchestration health risk."
    };

    return pkg;
  }

  pkg.phase3_diagnostics_gate = {
    applied: false,
    manifest_ok: manifestOk,
    registry_valid: registryValid,
    lineage_valid: lineageValid,
    reason:
      "Phase 3 diagnostics passed."
  };

  return pkg;
}
