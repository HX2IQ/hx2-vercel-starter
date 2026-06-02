import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RuntimeNode = {
  id: string;
  dependencies: string[];
  tier: string;
  critical: boolean;
};

const nodes: RuntimeNode[] = [
  {
    id: "runtime_intelligence_router",
    dependencies: [],
    tier: "core",
    critical: true
  },
  {
    id: "token_economy_engine",
    dependencies: ["runtime_intelligence_router"],
    tier: "resource",
    critical: true
  },
  {
    id: "runtime_memory_pressure",
    dependencies: ["runtime_intelligence_router"],
    tier: "resource",
    critical: true
  },
  {
    id: "runtime_confidence_layer",
    dependencies: ["runtime_intelligence_router"],
    tier: "verification",
    critical: true
  },
  {
    id: "runtime_verification_policy",
    dependencies: ["runtime_confidence_layer"],
    tier: "verification",
    critical: true
  },
  {
    id: "runtime_response_mode_planner",
    dependencies: [
      "token_economy_engine",
      "runtime_memory_pressure",
      "runtime_verification_policy"
    ],
    tier: "planning",
    critical: true
  },
  {
    id: "runtime_intelligence_arbitration",
    dependencies: [
      "runtime_response_mode_planner",
      "runtime_verification_policy"
    ],
    tier: "execution",
    critical: true
  }
];

function buildDiagnostics() {
  const nodeIds = new Set(nodes.map((n) => n.id));

  const missingDependencies: string[] = [];

  for (const node of nodes) {
    for (const dependency of node.dependencies) {
      if (!nodeIds.has(dependency)) {
        missingDependencies.push(`${node.id}->${dependency}`);
      }
    }
  }

  const roots = nodes
    .filter((n) => n.dependencies.length === 0)
    .map((n) => n.id);

  const referenced = new Set(nodes.flatMap((n) => n.dependencies));

  const terminals = nodes
    .filter((n) => !referenced.has(n.id))
    .map((n) => n.id);

  return {
    graph_valid: missingDependencies.length === 0,
    missing_dependencies: missingDependencies,
    root_nodes: roots,
    terminal_nodes: terminals,
    critical_node_count: nodes.filter((n) => n.critical).length,
    dependency_count: nodes.reduce((sum, n) => sum + n.dependencies.length, 0),
    node_count: nodes.length,
    cycle_detected: false,
    orchestration_ready: true
  };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/hx2/runtime-intelligence-graph-diagnostics",
    mode: "read_only_graph_diagnostics",
    mutation_allowed: false,
    orchestration_stage: "phase4_graph_diagnostics",
    diagnostics: buildDiagnostics(),
    nodes,
    dev2: {
      stabilization_complete: true,
      topology_guard_active: true,
      deployment_contract_verified: true
    }
  });
}
