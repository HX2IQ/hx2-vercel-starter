import * as StageRegistryModule from "./sprint-next-stage-registry";
import * as RegistryIntegrityModule from "./sprint-next-stage-registry-integrity";
import * as RegistryValidationModule from "./registry-driven-orchestration-validation";
import * as LineageModule from "./sprint-execution-package-lineage";
import * as LineageIntegrityModule from "./execution-lineage-integrity";
import {
  getOrchestrationStageDependencyRegistry,
  validateStageDependencies,
} from "./orchestration-stage-dependency-registry";

type AnyRecord = Record<string, any>;

function callOrRead(moduleRef: AnyRecord, preferredNames: string[], fallback: any) {
  for (const name of preferredNames) {
    const value = moduleRef[name];
    if (typeof value === "function") return value();
    if (value !== undefined) return value;
  }
  return fallback;
}

export function getOrchestrationCompilerSnapshot() {
  const registry = callOrRead(StageRegistryModule as AnyRecord, ["getSprintNextStageRegistry", "sprintNextStageRegistry"], []);
  const registryIntegrity = callOrRead(RegistryIntegrityModule as AnyRecord, ["getSprintNextStageRegistryIntegrity", "sprintNextStageRegistryIntegrity", "validateSprintNextStageRegistryIntegrity"], { ok: false });
  const registryValidation = callOrRead(RegistryValidationModule as AnyRecord, ["validateRegistryDrivenOrchestration", "registryDrivenOrchestrationValidation"], { ok: false });
  const lineage = callOrRead(LineageModule as AnyRecord, ["getSprintExecutionPackageLineage", "sprintExecutionPackageLineage"], []);
  const lineageIntegrity = callOrRead(LineageIntegrityModule as AnyRecord, ["getExecutionLineageIntegrity", "executionLineageIntegrity", "validateExecutionLineageIntegrity"], { ok: false });
  const dependencyRegistry = getOrchestrationStageDependencyRegistry();
  const dependencyRegistryValidation = validateStageDependencies();

  const orderedStages = Array.isArray(registry)
    ? registry.map((stage: any, index: number) => ({
        stage_id: stage.stage_id ?? stage.id ?? `stage_${index + 1}`,
        stage_type: stage.stage_type ?? stage.type ?? "unknown",
        helper: stage.helper ?? stage.helper_id ?? "unknown",
        order: index + 1,
        depends_on:
          dependencyRegistry.find((dependency: any) => dependency.stage_id === (stage.stage_id ?? stage.id))?.depends_on ??
          (Array.isArray(stage.depends_on) ? stage.depends_on : []),
      }))
    : [];

  const dependencyIssues = orderedStages.flatMap((stage: any) =>
    stage.depends_on
      .filter((dependencyId: string) => !orderedStages.some((candidate: any) => candidate.stage_id === dependencyId))
      .map((dependencyId: string) => ({
        stage_id: stage.stage_id,
        missing_dependency: dependencyId,
      }))
  );

  const blockingReasons: string[] = [];

  if (registryIntegrity?.ok === false) blockingReasons.push("stage_registry_integrity_failed");
  if (registryValidation?.ok === false) blockingReasons.push("registry_validation_failed");
  if (lineageIntegrity?.ok === false) blockingReasons.push("execution_lineage_integrity_failed");
  if (dependencyIssues.length > 0) blockingReasons.push("stage_dependency_validation_failed");
  if (dependencyRegistryValidation?.ok === false) blockingReasons.push("stage_dependency_registry_validation_failed");

  return {
    ok: true,
    compiler_id: "hx2-phase3-orchestration-compiler",
    compiler_phase: "phase_3b_foundation",
    compiler_mode: "read_only_preview",
    composition_mutation_allowed: false,
    stage_count: orderedStages.length,
    ordered_stages: orderedStages,
    registry_integrity: registryIntegrity,
    registry_validation: registryValidation,
    lineage_integrity: lineageIntegrity,
    dependency_validation: {
      ok: dependencyIssues.length === 0 && dependencyRegistryValidation?.ok !== false,
      issue_count: dependencyIssues.length,
      issues: dependencyIssues,
      registry_validation: dependencyRegistryValidation,
    },
    dependency_registry: dependencyRegistry,
    lineage,
    readiness: {
      compiler_ready: blockingReasons.length === 0,
      blocking_reasons: blockingReasons,
    },
  };
}

