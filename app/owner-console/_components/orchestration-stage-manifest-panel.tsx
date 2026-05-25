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

async function getStageManifest() {
  try {
    const base = getBaseUrl();

    const res = await fetch(`${base}/api/hx2/orchestration-stage-manifest`, {
      method: "GET",
      cache: "no-store"
    });

    if (!res.ok) {
      return {
        ok: false,
        stage_registry: [],
        stage_registry_integrity: {},
        stage_registry_validation: {}
      };
    }

    return await res.json();
  } catch {
    return {
      ok: false,
      stage_registry: [],
      stage_registry_integrity: {},
      stage_registry_validation: {}
    };
  }
}

export async function OrchestrationStageManifestPanel() {
  const data = await getStageManifest();
  const integrity = data?.stage_registry_integrity || {};
  const validation = data?.stage_registry_validation || {};
  const stages = data?.stage_registry || [];

  return (
    <div className="mt-4 rounded-2xl border border-blue-800 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold">Orchestration Stage Manifest</h2>
      <p className="mt-1 text-sm text-slate-400">
        Phase 3 deterministic orchestration stage registry health.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">Manifest API</div>
          <div className="mt-2 text-xl font-semibold text-white">{data?.ok ? "Available" : "Issue"}</div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">Stage Count</div>
          <div className="mt-2 text-xl font-semibold text-white">{integrity?.stage_count ?? stages.length}</div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">Registry OK</div>
          <div className="mt-2 text-xl font-semibold text-white">{integrity?.registry_ok ? "true" : "false"}</div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">Validation</div>
          <div className="mt-2 text-xl font-semibold text-white">{validation?.registry_valid ? "valid" : "review"}</div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
        <div className="text-sm font-semibold text-white">Registered Stages</div>
        <div className="mt-2 space-y-1 text-sm text-slate-300">
          {stages.map((stage: any) => (
            <div key={stage.id}>
              {stage.id} — {stage.stage_type} — {stage.helper}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
