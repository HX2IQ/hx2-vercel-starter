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

async function getLearningWeightsSummary() {
  try {
    const base = getBaseUrl();

    const res = await fetch(`${base}/api/hx2/learning-weights-summary`, {
      method: "GET",
      cache: "no-store"
    });

    if (!res.ok) {
      return { ok: false, weights: {}, posture: "unknown" };
    }

    return await res.json();
  } catch {
    return { ok: false, weights: {}, posture: "unknown" };
  }
}

function WeightStat({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-xl font-semibold text-white">{String(value)}</div>
    </div>
  );
}

export async function LearningWeightsSummaryPanel() {
  const data = await getLearningWeightsSummary();
  const weights = data?.weights || {};

  return (
    <div className="mt-4 rounded-2xl border border-cyan-800 bg-slate-900 p-5">
      <div>
        <h2 className="text-lg font-semibold">Persistent Learning Weights</h2>
        <p className="mt-1 text-sm text-slate-400">
          Adaptive orchestration bias layer derived from recorded outcomes.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <WeightStat title="Weights API" value={data?.ok ? "Available" : "Issue"} />
        <WeightStat title="Posture" value={data?.posture || "unknown"} />
        <WeightStat title="Stability Bias" value={weights?.stability_bias ?? 1} />
        <WeightStat title="Expansion Bias" value={weights?.expansion_bias ?? 1} />
        <WeightStat title="Verification Bias" value={weights?.verification_bias ?? 1} />
        <WeightStat title="Telemetry Bias" value={weights?.telemetry_bias ?? 1} />
      </div>
    </div>
  );
}
