import { getOrchestrationStageGraphSnapshot } from "./orchestration-stage-graph";

export function getOrchestrationExecutionPlanSnapshot() {
  const graph = getOrchestrationStageGraphSnapshot();

  const executionOrder = graph.topological_plan?.execution_order ?? [];

  const plannedStages = executionOrder.map((stageId: string, index: number) => {
    const node = graph.nodes.find((candidate: any) => candidate.id === stageId);

    return {
      stage_id: stageId,
      stage_type: node?.type ?? "unknown",
      helper: node?.helper ?? "unknown",
      execution_index: index + 1,
      mode: "preview_only",
    };
  });

  const blockingReasons: string[] = [];

  if (graph.compiler_ready !== true) blockingReasons.push("compiler_not_ready");
  if (graph.cycle_validation?.ok === false) blockingReasons.push("graph_cycle_detected");
  if (graph.dependency_validation?.ok === false) blockingReasons.push("dependency_validation_failed");
  if (graph.topological_plan?.ok === false) blockingReasons.push("topological_plan_failed");

  return {
    ok: blockingReasons.length === 0,
    plan_id: "hx2-phase3-orchestration-execution-plan",
    plan_phase: "phase_3b_preview",
    plan_mode: "read_only_preview",
    composition_mutation_allowed: false,
    execution_ready: blockingReasons.length === 0,
    blocking_reasons: blockingReasons,
    planned_stage_count: plannedStages.length,
    planned_stages: plannedStages,
    graph_summary: {
      node_count: graph.node_count,
      edge_count: graph.edge_count,
      cycle_validation: graph.cycle_validation,
      topological_plan: graph.topological_plan,
    },
  };
}
