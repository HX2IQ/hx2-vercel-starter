async function getReleaseHistory() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/releases`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, releases: [] };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), releases: [] };
  }
}

export default async function OwnerReleasePage({
  searchParams,
}: {
  searchParams: { file?: string };
}) {
  const file = searchParams?.file || "";
  const data = await getReleaseHistory();
  const releases = data?.releases || [];
  const release = releases.find((x: any) => x.file === file) || null;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold">Release Detail</h1>
        <p className="mt-2 text-sm text-slate-400">{file || "No release selected"}</p>

        {!release ? (
          <div className="mt-6 rounded-2xl border border-red-800 bg-red-950 p-4 text-sm text-red-200">
            Release detail unavailable
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                <div className="text-sm text-slate-400">File</div>
                <div className="mt-2 break-all text-sm text-white">{release.file}</div>

                <div className="mt-4 text-sm text-slate-400">Modified</div>
                <div className="mt-2 text-sm text-emerald-200">{release.modified_at || "unknown"}</div>

                <div className="mt-4 text-sm text-slate-400">Path</div>
                <div className="mt-2 break-all text-sm text-white">{release.path || "-"}</div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                <div className="text-sm text-slate-400">Preview</div>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
                  {release.preview || ""}
                </pre>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
