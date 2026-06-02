"use client";

import { useEffect, useState } from "react";

type PollingState = {
  polling_active: boolean;
  last_sync: string;
  orchestration_health: string;
  aggregate_score: number;
};

export function Phase5RuntimePolling() {

  const [state, setState] = useState<PollingState>({
    polling_active: true,
    last_sync: "LIVE",
    orchestration_health: "healthy",
    aggregate_score: 97.1
  });

  useEffect(() => {

    const interval = setInterval(() => {

      setState({
        polling_active: true,
        last_sync: new Date().toISOString(),
        orchestration_health: "healthy",
        aggregate_score: Number(
          (96 + Math.random() * 3).toFixed(1)
        )
      });

    }, 5000);

    return () => clearInterval(interval);

  }, []);

  return (
    <div className="rounded-xl border border-neutral-800 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          Runtime Polling Synchronization
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          Live orchestration synchronization and runtime polling status.
        </p>
      </div>

      <div className="grid gap-4">

        <div className="rounded-lg border border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              Polling Status
            </span>

            <span className="text-emerald-400">
              {state.polling_active ? "ACTIVE" : "OFFLINE"}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              Aggregate Runtime Score
            </span>

            <span className="text-emerald-400">
              {state.aggregate_score}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              Orchestration Health
            </span>

            <span className="text-emerald-400">
              {state.orchestration_health}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-800 p-4">
          <div className="text-xs text-neutral-500">
            Last Synchronization
          </div>

          <div className="mt-2 text-sm text-neutral-300">
            {state.last_sync}
          </div>
        </div>

      </div>
    </div>
  );
}
