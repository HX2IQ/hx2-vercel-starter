import { sprintNextStageRegistry } from "./sprint-next-stage-registry";

export type OrchestrationStageDependency = {
  stage_id: string;
  depends_on: string[];
};

export function getOrchestrationStageDependencyRegistry(): OrchestrationStageDependency[] {
  return sprintNextStageRegistry.map((stage: any) => ({
    stage_id: stage.stage_id,
    depends_on: Array.isArray(stage.depends_on)
      ? stage.depends_on
      : [],
  }));
}

export function validateStageDependencies() {
  const registry = getOrchestrationStageDependencyRegistry();

  const knownStages = registry.map((x) => x.stage_id);

  const missingDependencies = registry.flatMap((stage) =>
    stage.depends_on
      .filter((dependency) => !knownStages.includes(dependency))
      .map((dependency) => ({
        stage_id: stage.stage_id,
        missing_dependency: dependency,
      }))
  );

  const circularSelfDependencies = registry
    .filter((stage) => stage.depends_on.includes(stage.stage_id))
    .map((stage) => ({
      stage_id: stage.stage_id,
    }));

  return {
    ok:
      missingDependencies.length === 0 &&
      circularSelfDependencies.length === 0,

    dependency_stage_count: registry.length,

    missing_dependencies: missingDependencies,

    circular_self_dependencies: circularSelfDependencies,
  };
}
