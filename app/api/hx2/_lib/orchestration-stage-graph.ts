import { getOrchestrationCompilerSnapshot } from "./orchestration-compiler";

export function getOrchestrationStageGraphSnapshot() {
  const compiler = getOrchestrationCompilerSnapshot();

  const nodes = compiler.ordered_stages.map((stage: any) => ({
    id: stage.stage_id,
    type: stage.stage_type,
    helper: stage.helper,
    order: stage.order,
  }));

  const edges = compiler.ordered_stages.flatMap((stage: any) =>
    (stage.depends_on ?? []).map((dependencyId: string) => ({
      from: dependencyId,
      to: stage.stage_id,
    }))
  );

  return {
    ok: true,
    graph_id: "hx2-phase3-orchestration-stage-graph",
    graph_phase: "phase_3b_preview",
    graph_mode: "read_only_preview",
    composition_mutation_allowed: false,
    node_count: nodes.length,
    edge_count: edges.length,
    nodes,
    edges,
    compiler_ready: compiler.readiness?.compiler_ready === true,
    dependency_validation: compiler.dependency_validation,
  };
}
