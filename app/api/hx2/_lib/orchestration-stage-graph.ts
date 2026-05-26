import { getOrchestrationCompilerSnapshot } from "./orchestration-compiler";

function detectGraphCycles(nodes: any[], edges: any[]) {
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    adjacency.set(edge.from, [...(adjacency.get(edge.from) ?? []), edge.to]);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const cycles: string[][] = [];

  function visit(nodeId: string, path: string[]) {
    if (visiting.has(nodeId)) {
      const startIndex = path.indexOf(nodeId);
      cycles.push([...path.slice(startIndex), nodeId]);
      return;
    }

    if (visited.has(nodeId)) return;

    visiting.add(nodeId);

    for (const next of adjacency.get(nodeId) ?? []) {
      visit(next, [...path, nodeId]);
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
  }

  for (const node of nodes) {
    visit(node.id, []);
  }

  return {
    ok: cycles.length === 0,
    cycle_count: cycles.length,
    cycles,
  };
}


function buildTopologicalExecutionPlan(nodes: any[], edges: any[]) {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    adjacency.set(edge.from, [...(adjacency.get(edge.from) ?? []), edge.to]);
    inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
  }

  const ready = nodes
    .filter((node) => (inDegree.get(node.id) ?? 0) === 0)
    .sort((a, b) => a.order - b.order)
    .map((node) => node.id);

  const executionOrder: string[] = [];

  while (ready.length > 0) {
    const current = ready.shift()!;
    executionOrder.push(current);

    for (const next of adjacency.get(current) ?? []) {
      inDegree.set(next, (inDegree.get(next) ?? 0) - 1);

      if ((inDegree.get(next) ?? 0) === 0) {
        ready.push(next);
        ready.sort((a, b) => {
          const aOrder = nodes.find((node) => node.id === a)?.order ?? 9999;
          const bOrder = nodes.find((node) => node.id === b)?.order ?? 9999;
          return aOrder - bOrder;
        });
      }
    }
  }

  const blockedStages = nodes
    .filter((node) => !executionOrder.includes(node.id))
    .map((node) => node.id);

  return {
    ok: blockedStages.length === 0,
    execution_order: executionOrder,
    blocked_stages: blockedStages,
    planned_stage_count: executionOrder.length,
  };
}
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

  const cycle_validation = detectGraphCycles(nodes, edges);
  const topological_plan = buildTopologicalExecutionPlan(nodes, edges);

  return {
    ok: cycle_validation.ok,
    graph_id: "hx2-phase3-orchestration-stage-graph",
    graph_phase: "phase_3b_preview",
    graph_mode: "read_only_preview",
    composition_mutation_allowed: false,
    node_count: nodes.length,
    edge_count: edges.length,
    nodes,
    edges,
    cycle_validation,
    topological_plan,
    compiler_ready: compiler.readiness?.compiler_ready === true,
    dependency_validation: compiler.dependency_validation,
  };
}

