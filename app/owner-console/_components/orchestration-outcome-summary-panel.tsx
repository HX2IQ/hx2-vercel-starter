function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;

  if (process.env.VERCEL_URL) {
    return process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

async function getOutcomeSummary() {
  try {
    const base = getBaseUrl();

    const res = await fetch(`${base}/api/hx2/orchestration-outcome-summary`, {
      method: "GET",
      cache: "no-store"
    });

    if (!res.ok) {
      return { ok: false, record_count: 0, alignment_counts: {}, average_learning_weight: 0, latest_record: null };
    }

    return await res.json();
  } catch {
    return { ok: false, record_count: 0, alignment_counts: {}, average_learning_weight: 0, latest_record: null };
  }
}

function OutcomeStat({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-xl font-semibold text-white">{String(value)}</div>
    </div>
  );
}

export async function OrchestrationOutcomeSummaryPanel() {
  const data = await getOutcomeSummary();
  const counts = data?.alignment_counts || {};
  const latest = data?.latest_record || null;

  return (
    <div className="mt-4 rounded-2xl border border-emerald-800 bg-slate-900 p-5">
      <div>
        <h2 className="text-lg font-semibold">Orchestration Outcome Summary</h2>
        <p className="mt-1 text-sm text-slate-400">
          Persistent runtime telemetry from recorded orchestration outcomes.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <OutcomeStat title="Summary API" value={data?.ok ? "Available" : "Issue"} />
        <OutcomeStat title="Records" value={data?.record_count ?? 0} />
        <OutcomeStat title="Avg Learning Weight" value={data?.average_learning_weight ?? 0} />
        <OutcomeStat title="Aligned" value={counts?.aligned ?? 0} />
        <OutcomeStat title="Partial" value={counts?.partial ?? 0} />
        <OutcomeStat title="Misaligned" value={counts?.misaligned ?? 0} />
      </div>

      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
        <div className="text-sm font-semibold text-white">Latest Record</div>
        <div className="mt-2 text-sm text-slate-300">
          {latest
            ? `${latest.execution_id || "unknown"} — ${latest.alignment || "unknown"} — weight ${latest.learning_weight ?? 0}`
            : "No outcome records yet."}
        </div>
      </div>
    </div>
  );
}
