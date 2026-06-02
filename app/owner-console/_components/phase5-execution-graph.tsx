type ExecutionGraphNode = {
  node: string;
  connections: string[];
  status: string;
};

const graphNodes: ExecutionGraphNode[] = [
  {
    node: "Multi-Node Arbitration",
    connections: ["Adaptive Confidence", "Execution Memory"],
    status: "ACTIVE"
  },
  {
    node: "Adaptive Confidence",
    connections: ["Runtime Decision Graph"],
    status: "ACTIVE"
  },
  {
    node: "Execution Memory",
    connections: ["Execution Learning"],
    status: "ACTIVE"
  },
  {
    node: "Runtime Decision Graph",
    connections: ["Adaptive Runtime Optimization"],
    status: "ACTIVE"
  },
  {
    node: "Telemetry Intelligence",
    connections: ["Autonomous Tuning"],
    status: "ACTIVE"
  }
];

export function Phase5ExecutionGraph() {

  return (
    <div className="rounded-xl border border-neutral-800 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          Runtime Execution Graph
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          Live orchestration execution topology and intelligence routing.
        </p>
      </div>

      <div className="grid gap-4">
        {graphNodes.map((node) => (
          <div
            key={node.node}
            className="rounded-lg border border-neutral-800 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {node.node}
              </span>

              <span className="text-sm text-emerald-400">
                {node.status}
              </span>
            </div>

            <div className="mt-3 text-xs text-neutral-500">
              Connections:
            </div>

            <ul className="mt-2 list-disc pl-5 text-sm text-neutral-300">
              {node.connections.map((connection) => (
                <li key={connection}>
                  {connection}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
