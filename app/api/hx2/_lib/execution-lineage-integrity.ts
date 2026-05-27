import { getSprintExecutionPackageLineage } from "./sprint-execution-package-lineage";

export function validateExecutionPackageLineage(
  lineage: string[]
) {
  const duplicates = lineage.filter(
    (item, index) => lineage.indexOf(item) !== index
  );

  const hasRoot = lineage.includes("root");
  const hasRegistryValidation = lineage.includes("registry-validation");

  const rootIndex = lineage.indexOf("root");
  const registryIndex = lineage.indexOf("registry-validation");
  const decisionIndex = lineage.indexOf("decision-stage");
  const restraintIndex = lineage.indexOf("adaptive-restraint");

  const orderingValid =
    rootIndex === 0 &&
    registryIndex > rootIndex &&
    (restraintIndex === -1 || decisionIndex === -1 || restraintIndex < decisionIndex);

  const lineageValid =
    duplicates.length === 0 &&
    hasRoot &&
    hasRegistryValidation &&
    orderingValid;

  return {
    ok: lineageValid,
    lineage_valid: lineageValid,
    duplicate_lineage_stages: Array.from(new Set(duplicates)),
    missing_root: !hasRoot,
    missing_registry_validation: !hasRegistryValidation,
    ordering_valid: orderingValid
  };
}

export function getExecutionLineageIntegrity() {
  return validateExecutionPackageLineage(getSprintExecutionPackageLineage());
}

export const validateExecutionLineageIntegrity = getExecutionLineageIntegrity;
export const executionLineageIntegrity = getExecutionLineageIntegrity;
