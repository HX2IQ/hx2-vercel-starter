import { getOrchestrationCompilerSnapshot } from "./orchestration-compiler";
import { validateStageDependencies } from "./orchestration-stage-dependency-registry";
import { getOrchestrationStageGraphSnapshot } from "./orchestration-stage-graph";
import { getOrchestrationExecutionPlanSnapshot } from "./orchestration-execution-plan";

export function getPhase3BOrchestrationStatusSnapshot() {
  const compiler = getOrchestrationCompilerSnapshot();
  const dependencyValidation = validateStageDependencies();
  const graph = getOrchestrationStageGraphSnapshot();
  const executionPlan = getOrchestrationExecutionPlanSnapshot();

  const blocking_reasons = [
    ...(compiler.readiness?.blocking_reasons ?? []),
    ...(dependencyValidation.ok ? [] : ["dependency_registry_not_ready"]),
    ...(graph.cycle_validation?.ok ? [] : ["graph_cycle_validation_failed"]),
    ...(graph.topological_plan?.ok ? [] : ["topological_plan_not_ready"]),
    ...(executionPlan.execution_ready ? [] : executionPlan.blocking_reasons ?? []),
  ];

  return {
    ok: blocking_reasons.length === 0,
    phase: "phase_3b",
    status_id: "hx2-phase3b-orchestration-status",
    status_mode: "read_only_snapshot",
    composition_mutation_allowed: false,
    readiness: {
      phase3b_ready: blocking_reasons.length === 0,
      blocking_reasons,
    },
    compiler: {
      ready: compiler.readiness?.compiler_ready === true,
      stage_count: compiler.stage_count,
    },
    dependencies: {
      ready: dependencyValidation.ok === true,
      dependency_stage_count: dependencyValidation.dependency_stage_count,
    },
    graph: {
      ready: graph.ok === true,
      node_count: graph.node_count,
      edge_count: graph.edge_count,
      cycle_validation: graph.cycle_validation,
      topological_plan: graph.topological_plan,
    },
    execution_plan: {
      ready: executionPlan.execution_ready === true,
      planned_stage_count: executionPlan.planned_stage_count,
    },
  };
}
