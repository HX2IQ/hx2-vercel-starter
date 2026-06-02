import { Phase5ExecutionGraph } from "./phase5-execution-graph";
import { Phase5TelemetryVisualization } from "./phase5-telemetry-visualization";
type DashboardPanel = {
  title: string;
  status: string;
};

const panels: DashboardPanel[] = [
  {
    title: "Multi-Node Arbitration",
    status: "ACTIVE"
  },
  {
    title: "Adaptive Confidence",
    status: "ACTIVE"
  },
  {
    title: "Execution Memory",
    status: "ACTIVE"
  },
  {
    title: "Runtime Decision Graph",
    status: "ACTIVE"
  },
  {
    title: "Telemetry Intelligence",
    status: "ACTIVE"
  },
  {
    title: "Autonomous Tuning",
    status: "ACTIVE"
  },
  {
    title: "Adaptive Runtime Optimization",
    status: "ACTIVE"
  }
];

export function Phase5OrchestrationDashboard() {

  return (
    <div className="rounded-xl border border-neutral-800 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          Phase 5 Orchestration Intelligence
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          Adaptive orchestration runtime visualization.
        </p>
      </div>

      <div className="grid gap-4">
        {panels.map((panel) => (
          <div
            key={panel.title}
            className="rounded-lg border border-neutral-800 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {panel.title}
              </span>

              <span className="text-sm text-emerald-400">
                {panel.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    <div className="mt-6">
        <Phase5ExecutionGraph />
      </div>
    </div>
  );
}


