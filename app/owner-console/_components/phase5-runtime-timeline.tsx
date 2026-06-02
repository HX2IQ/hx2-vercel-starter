type TimelineItem = {
  label: string;
  score: string;
  timestamp: string;
};

const timeline: TimelineItem[] = [
  {
    label: "Execution Learning Snapshot",
    score: "96.4",
    timestamp: "T-3"
  },
  {
    label: "Telemetry Synchronization",
    score: "98.1",
    timestamp: "T-2"
  },
  {
    label: "Adaptive Runtime Optimization",
    score: "97.5",
    timestamp: "T-1"
  },
  {
    label: "Orchestration Health Refresh",
    score: "98.4",
    timestamp: "LIVE"
  }
];

export function Phase5RuntimeTimeline() {

  return (
    <div className="rounded-xl border border-neutral-800 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          Runtime History Timeline
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          Persistent orchestration history and execution timeline.
        </p>
      </div>

      <div className="grid gap-3">
        {timeline.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-neutral-800 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {item.label}
              </span>

              <span className="text-emerald-400">
                {item.score}
              </span>
            </div>

            <div className="mt-2 text-xs text-neutral-500">
              Timeline Position: {item.timestamp}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
