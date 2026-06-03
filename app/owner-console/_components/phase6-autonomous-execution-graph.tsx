type ExecutionGraphNode = {
  node: string;
  status: string;
};

const executionNodes: ExecutionGraphNode[] = [
  {
    node: "Task Ingestion",
    status: "ACTIVE"
  },
  {
    node: "Agent Routing",
    status: "ACTIVE"
  },
  {
    node: "Verification Runtime",
    status: "ACTIVE"
  },
  {
    node: "Execution Commit",
    status: "ACTIVE"
  },
  {
    node: "Telemetry Sync",
    status: "ACTIVE"
  }
];

export function Phase6AutonomousExecutionGraph() {

  return (
    <div className="rounded-xl border border-amber-900 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-amber-400">
          Phase 6 Autonomous Execution Graph
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          Autonomous execution dependency routing and orchestration graph.
        </p>
      </div>

      <div className="grid gap-3">
        {executionNodes.map((node) => (
          <div
            key={node.node}
            className="rounded-lg border border-amber-950 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {node.node}
              </span>

              <span className="text-amber-400">
                {node.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
