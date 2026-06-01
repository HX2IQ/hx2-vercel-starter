import { NextResponse } from "next/server";

type RuntimeNode = {
  node: string;
  role: string;
  upstream_dependencies: string[];
};

const activeNodes: RuntimeNode[] = [
  {
    node: "runtime_intelligence_router",
    role: "routing",
    upstream_dependencies: []
  },
  {
    node: "token_economy_engine",
    role: "token_budgeting",
    upstream_dependencies: ["runtime_intelligence_router"]
  },
  {
    node: "runtime_memory_pressure",
    role: "memory_management",
    upstream_dependencies: ["runtime_intelligence_router"]
  },
  {
    node: "runtime_confidence_layer",
    role: "confidence_scoring",
    upstream_dependencies: ["runtime_intelligence_router"]
  },
  {
    node: "runtime_verification_policy",
    role: "verification_governance",
    upstream_dependencies: ["runtime_confidence_layer"]
  },
  {
    node: "runtime_response_mode_planner",
    role: "response_planning",
    upstream_dependencies: [
      "token_economy_engine",
      "runtime_memory_pressure",
      "runtime_verification_policy"
    ]
  },
  {
    node: "runtime_intelligence_arbitration",
    role: "reasoning_arbitration",
    upstream_dependencies: [
      "runtime_response_mode_planner",
      "runtime_verification_policy"
    ]
  }
];

function validateDependencies(nodes: RuntimeNode[]) {
  const nodeNames = new Set(nodes.map((entry) => entry.node));
  const duplicateNodes = nodes
    .map((entry) => entry.node)
    .filter((node, index, all) => all.indexOf(node) !== index);

  const missingDependencies: string[] = [];

  for (const entry of nodes) {
    for (const dependency of entry.upstream_dependencies) {
      if (!nodeNames.has(dependency)) {
        missingDependencies.push(`${entry.node}->${dependency}`);
      }
    }
  }

  const roots = nodes
    .filter((entry) => entry.upstream_dependencies.length === 0)
    .map((entry) => entry.node);

  const referenced = new Set(nodes.flatMap((entry) => entry.upstream_dependencies));

  const terminalNodes = nodes
    .filter((entry) => !referenced.has(entry.node))
    .map((entry) => entry.node);

  return {
    dependency_validation: {
      valid: duplicateNodes.length === 0 && missingDependencies.length === 0,
      duplicate_nodes: [...new Set(duplicateNodes)],
      missing_dependencies: missingDependencies,
      root_nodes: roots,
      terminal_nodes: terminalNodes,
      dependency_count: nodes.reduce(
        (total, entry) => total + entry.upstream_dependencies.length,
        0
      ),
      node_count: nodes.length
    }
  };
}

export async function GET() {
  const validation = validateDependencies(activeNodes);

  return NextResponse.json({
    ok: true,
    route: "/api/hx2/runtime-intelligence-dependency-validation",
    mode: "read_only_dependency_validation",
    mutation_allowed: false,
    orchestration_stage: "kgx_lite_dependency_validation",
    ...validation
  });
}
