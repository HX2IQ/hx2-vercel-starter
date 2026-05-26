async function getBaselineDetail(baseline: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(
      `${base}/api/owner/baseline-detail?baseline=${encodeURIComponent(baseline)}`,
      { cache: "no-store" }
    );

    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export default async function OwnerBaselinePage({
  searchParams,
}: {
  searchParams: { baseline?: string };
}) {
  const baseline = searchParams?.baseline || "";
  const data = baseline ? await getBaselineDetail(baseline) : { ok: false, error: "Missing baseline" };
  const detail = data?.detail || null;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold">Baseline Detail</h1>
        <p className="mt-2 text-sm text-slate-400">{baseline || "No baseline selected"}</p>

        {!detail ? (
          <div className="mt-6 rounded-2xl border border-red-800 bg-red-950 p-4 text-sm text-red-200">
            {data?.error || "Baseline detail unavailable"}
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                <div className="text-sm text-slate-400">X2 Anchor</div>
                <div className="mt-2 text-sm text-white">{detail?.x2_baseline?.anchor_source || "-"}</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                <div className="text-sm text-slate-400">H2 Anchor</div>
                <div className="mt-2 text-sm text-white">{detail?.h2_baseline?.anchor_source || "-"}</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                <div className="text-sm text-slate-400">Path</div>
                <div className="mt-2 break-all text-sm text-white">{detail?.path || "-"}</div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                <div className="text-sm text-slate-400">X2 Baseline Reply</div>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
                  {detail?.replies?.x2_baseline || ""}
                </pre>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                <div className="text-sm text-slate-400">H2 Baseline Reply</div>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
                  {detail?.replies?.h2_baseline || ""}
                </pre>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-4">
              <div className="text-sm text-slate-400">Manifest</div>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
                {JSON.stringify(detail?.manifest || {}, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
