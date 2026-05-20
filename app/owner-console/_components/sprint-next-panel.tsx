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

async function getSprintNextPreview() {
  try {
    const base = getBaseUrl();

    const res = await fetch(`${base}/api/hx2/sprint-next`, {
      method: "POST",
      cache: "no-store",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: "Sprint next build intelligence capability"
      })
    });

    if (!res.ok) {
      return { ok: false, sprint_next: {}, error: `HTTP ${res.status}` };
    }

    return await res.json();
  } catch (err: any) {
    return {
      ok: false,
      sprint_next: {},
      error: err?.message || "sprint-next preview failed"
    };
  }
}

function SprintNextStat({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-xl font-semibold text-white">{String(value)}</div>
    </div>
  );
}

export async function SprintNextPreviewPanel() {
  const data = await getSprintNextPreview();
  const sprint = data?.sprint_next || {};
  const buildops = sprint?.buildops_sprint_plan || {};
  const history = sprint?.history_summary || {};

  return (
    <div className="mt-4 rounded-2xl border border-purple-800 bg-slate-900 p-5">
      <div>
        <h2 className="text-lg font-semibold">Sprint Next Planner</h2>
        <p className="mt-1 text-sm text-slate-400">
          Planner-driven DEV2 build sequencing preview.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <SprintNextStat title="API" value={data?.ok ? "Available" : "Issue"} />
        <SprintNextStat title="Intent" value={sprint?.intent || "unknown"} />
        <SprintNextStat title="Selected Node" value={sprint?.selected_node || "unknown"} />
        <SprintNextStat title="Execution Mode" value={sprint?.execution_mode || "unknown"} />
        <SprintNextStat title="Sprint Type" value={buildops?.sprint_type || "unknown"} />
        <SprintNextStat title="Risk Level" value={buildops?.risk_level || "unknown"} />
      </div>

      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
        <div className="text-sm font-semibold text-white">History Summary</div>

        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <SprintNextStat title="Top Sprint Type" value={history?.top_sprint_type || "unknown"} />
          <SprintNextStat title="Top Mode" value={history?.top_execution_mode || "unknown"} />
          <SprintNextStat title="Top Success Node" value={history?.top_success_node || "unknown"} />
          <SprintNextStat title="Top Failure Node" value={history?.top_failure_node || "unknown"} />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
        <div className="text-sm font-semibold text-white">Sprint Recommendation</div>
        <div className="mt-2 text-sm text-slate-300">
          {sprint?.sprint_recommendation || "No sprint recommendation available."}
        </div>
      </div>
    </div>
  );
}

