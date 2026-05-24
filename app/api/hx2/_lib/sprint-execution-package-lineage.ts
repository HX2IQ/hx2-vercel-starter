export type SprintExecutionPackageLineage = {
  root_package: any;
  active_package: any;
  lineage: string[];
};

export function buildSprintExecutionPackageLineage(
  rootPackage: any
): SprintExecutionPackageLineage {

  return {
    root_package: rootPackage,
    active_package: rootPackage,
    lineage: ["root"]
  };
}

export function evolveSprintExecutionPackage(
  lineage: SprintExecutionPackageLineage,
  label: string,
  nextPackage: any
): SprintExecutionPackageLineage {

  return {
    root_package: lineage.root_package,
    active_package: nextPackage,
    lineage: [
      ...lineage.lineage,
      label
    ]
  };
}
