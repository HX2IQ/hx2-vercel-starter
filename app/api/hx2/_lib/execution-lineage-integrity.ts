export function validateExecutionPackageLineage(
  lineage: string[]
) {

  const duplicates =
    lineage.filter(
      (item, index) =>
        lineage.indexOf(item) !== index
    );

  const hasRoot =
    lineage.includes("root");

  const restraintIndex =
    lineage.indexOf("adaptive-restraint");

  const registryIndex =
    lineage.indexOf("registry-validation");

  const orderingValid =
    restraintIndex === -1 ||
    registryIndex === -1 ||
    restraintIndex < registryIndex;

  return {
    lineage_valid:
      duplicates.length === 0 &&
      hasRoot &&
      orderingValid,

    duplicate_lineage_stages:
      Array.from(new Set(duplicates)),

    missing_root:
      !hasRoot,

    ordering_valid:
      orderingValid
  };
}
