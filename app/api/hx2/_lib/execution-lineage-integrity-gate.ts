export function applyExecutionLineageIntegrityGate(
  sprintPackage: any,
  lineageIntegrity: any
) {
  const pkg = { ...sprintPackage };

  if (lineageIntegrity?.lineage_valid === false) {
    pkg.files_to_touch = ["lineage stabilization only"];

    pkg.expected_guards = Array.from(
      new Set([
        ...(pkg.expected_guards || []),
        "Execution lineage integrity review",
        "npm run hx2:quick",
        "npm run hx2:chat-master:guard"
      ])
    );

    pkg.execution_lineage_integrity_gate = {
      applied: true,
      reason: "Execution package lineage failed integrity validation.",
      duplicate_lineage_stages:
        lineageIntegrity?.duplicate_lineage_stages || [],
      missing_root:
        lineageIntegrity?.missing_root === true,
      ordering_valid:
        lineageIntegrity?.ordering_valid !== false
    };

    return pkg;
  }

  pkg.execution_lineage_integrity_gate = {
    applied: false,
    reason: "Execution package lineage integrity passed.",
    duplicate_lineage_stages: [],
    missing_root: false,
    ordering_valid: true
  };

  return pkg;
}
