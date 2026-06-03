type EventStreamItem = {
  event: string;
  status: string;
  timestamp: string;
};

const events: EventStreamItem[] = [
  {
    event: "Execution learning cycle completed",
    status: "SUCCESS",
    timestamp: "LIVE"
  },
  {
    event: "Adaptive runtime optimization updated",
    status: "SUCCESS",
    timestamp: "LIVE"
  },
  {
    event: "Telemetry intelligence synchronized",
    status: "SUCCESS",
    timestamp: "LIVE"
  },
  {
    event: "Execution arbitration recalibrated",
    status: "SUCCESS",
    timestamp: "LIVE"
  }
];

export function Phase5EventStream() {

  return (
    <div className="rounded-xl border border-neutral-800 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          Orchestration Event Stream
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          Live orchestration event activity and execution stream.
        </p>
      </div>

      <div className="grid gap-3">
        {events.map((item) => (
          <div
            key={item.event}
            className="rounded-lg border border-neutral-800 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {item.event}
              </span>

              <span className="text-emerald-400">
                {item.status}
              </span>
            </div>

            <div className="mt-2 text-xs text-neutral-500">
              Timestamp: {item.timestamp}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
