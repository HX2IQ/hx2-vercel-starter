function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  if (process.env.VERCEL_URL) {
    return process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

async function postJson(path: string, body: any, fallback: any) {
  try {
    const base = getBaseUrl();

    const res = await fetch(`${base}${path}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      return { ...fallback, ok: false, error: `HTTP ${res.status}` };
    }

    return await res.json();
  } catch (err: any) {
    return {
      ...fallback,
      ok: false,
      error: err?.message || "planner preview fetch failed"
    };
  }
}

function PlannerStat({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-xl font-semibold text-white">{String(value)}</div>
    </div>
  );
}

async function getCapabilityPlannerPreview() {
  return postJson(
    "/api/hx2/capability-planner",
    {
      message: "Analyze XRP market conditions with risk and narrative context"
    },
    {
      ok: false,
      intent: "unknown",
      selected_node: "unknown",
      candidate_nodes: [],
      execution_mode: "unknown",
      escalation: {},
      orchestration_synthesis: {},
      execution_pipeline: []
    }
  );
}

export async function CapabilityPlannerPreviewPanel() {
  const data = await getCapabilityPlannerPreview();

  const candidates = data?.candidate_nodes || [];
  const synthesis = data?.orchestration_synthesis || {};
  const escalation = data?.escalation || {};
  const pipeline = data?.execution_pipeline || [];

  return (
    <div className="mt-4 rounded-2xl border border-cyan-800 bg-slate-900 p-5">
      <div>
        <h2 className="text-lg font-semibold">Capability Planner Preview</h2>
        <p className="mt-1 text-sm text-slate-400">
          Live orchestration intelligence preview: intent, node scoring, execution mode, escalation, and synthesis.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <PlannerStat title="Planner API" value={data?.ok ? "Available" : "Issue"} />
        <PlannerStat title="Intent" value={data?.intent || "unknown"} />
        <PlannerStat title="Selected Node" value={data?.selected_node || "unknown"} />
        <PlannerStat title="Execution Mode" value={data?.execution_mode || "unknown"} />
        <PlannerStat title="Escalated" value={escalation?.escalated ? "true" : "false"} />
        <PlannerStat title="Pipeline Steps" value={pipeline.length} />
      </div>

      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
        <div className="text-sm font-semibold text-white">Orchestration Synthesis</div>
        <div className="mt-2 text-sm text-slate-300">
          {synthesis?.synthesis_summary || data?.orchestration_summary || "No synthesis available."}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {candidates.map((candidate: any) => (
          <div key={candidate.node} className="rounded-xl border border-slate-700 bg-slate-950 p-4">
            <div className="font-mono text-sm text-cyan-300">{candidate.node}</div>
            <div className="mt-1 text-sm text-white">Score: {candidate.score}</div>
            <div className="mt-1 text-xs text-slate-400">{candidate.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
