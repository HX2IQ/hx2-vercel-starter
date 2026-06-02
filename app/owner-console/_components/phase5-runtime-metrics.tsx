type RuntimeMetric = {
  metric: string;
  value: string;
  trend: string;
};

const runtimeMetrics: RuntimeMetric[] = [
  {
    metric: "Runtime Throughput",
    value: "98.4%",
    trend: "UP"
  },
  {
    metric: "Execution Stability",
    value: "99.1%",
    trend: "STABLE"
  },
  {
    metric: "Adaptive Optimization",
    value: "96.8%",
    trend: "UP"
  },
  {
    metric: "Telemetry Accuracy",
    value: "97.9%",
    trend: "UP"
  },
  {
    metric: "Execution Arbitration",
    value: "95.7%",
    trend: "STABLE"
  }
];

export function Phase5RuntimeMetrics() {

  return (
    <div className="rounded-xl border border-neutral-800 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          Live Runtime Metrics
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          Real-time orchestration runtime and execution performance metrics.
        </p>
      </div>

      <div className="grid gap-3">
        {runtimeMetrics.map((metric) => (
          <div
            key={metric.metric}
            className="rounded-lg border border-neutral-800 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {metric.metric}
              </span>

              <span className="text-emerald-400">
                {metric.value}
              </span>
            </div>

            <div className="mt-2 text-xs text-neutral-500">
              Trend: {metric.trend}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
