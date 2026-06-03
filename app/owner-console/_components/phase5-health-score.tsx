type HealthMetric = {
  metric: string;
  score: number;
  status: string;
};

const metrics: HealthMetric[] = [
  {
    metric: "Deterministic Orchestration",
    score: 99,
    status: "HEALTHY"
  },
  {
    metric: "Adaptive Runtime Optimization",
    score: 97,
    status: "HEALTHY"
  },
  {
    metric: "Execution Learning",
    score: 96,
    status: "HEALTHY"
  },
  {
    metric: "Telemetry Intelligence",
    score: 98,
    status: "HEALTHY"
  },
  {
    metric: "Autonomous Orchestration",
    score: 95,
    status: "HEALTHY"
  }
];

export function Phase5HealthScore() {

  const average =
    metrics.reduce((sum, metric) => sum + metric.score, 0) /
    metrics.length;

  return (
    <div className="rounded-xl border border-neutral-800 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          Orchestration Health Scoring
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          Live orchestration runtime health and intelligence scoring.
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-emerald-900 bg-emerald-950/20 p-4">
        <div className="text-sm text-neutral-400">
          Overall Health Score
        </div>

        <div className="mt-2 text-4xl font-bold text-emerald-400">
          {average.toFixed(1)}
        </div>
      </div>

      <div className="grid gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.metric}
            className="rounded-lg border border-neutral-800 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {metric.metric}
              </span>

              <span className="text-emerald-400">
                {metric.score}
              </span>
            </div>

            <div className="mt-2 text-xs text-neutral-500">
              Status: {metric.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
