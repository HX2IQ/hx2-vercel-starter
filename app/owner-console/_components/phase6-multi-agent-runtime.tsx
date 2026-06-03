type AgentRuntime = {
  agent: string;
  role: string;
  status: string;
};

const runtimeAgents: AgentRuntime[] = [
  {
    agent: "DEV2",
    role: "Build Stabilization",
    status: "ACTIVE"
  },
  {
    agent: "O2",
    role: "Executive Orchestration",
    status: "ACTIVE"
  },
  {
    agent: "V2",
    role: "Verification Layer",
    status: "ACTIVE"
  },
  {
    agent: "DA3",
    role: "Adversarial Validation",
    status: "ACTIVE"
  },
  {
    agent: "KGX",
    role: "Knowledge Graph Runtime",
    status: "ACTIVE"
  }
];

export function Phase6MultiAgentRuntime() {

  return (
    <div className="rounded-xl border border-fuchsia-900 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-fuchsia-400">
          Phase 6 Multi-Agent Runtime
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          Autonomous multi-agent orchestration runtime mesh.
        </p>
      </div>

      <div className="grid gap-3">
        {runtimeAgents.map((agent) => (
          <div
            key={agent.agent}
            className="rounded-lg border border-fuchsia-950 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {agent.agent}
                </div>

                <div className="mt-1 text-xs text-neutral-500">
                  {agent.role}
                </div>
              </div>

              <span className="text-fuchsia-400">
                {agent.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
