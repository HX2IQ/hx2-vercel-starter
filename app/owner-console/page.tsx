async function getOwnerSummary() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/summary`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

async function getBaselineHistory() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/baselines`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, baselines: [], stability: {} };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), baselines: [], stability: {} };
  }
}

async function getOwnerHealth() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/health`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, checks: [] };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), checks: [] };
  }
}

async function getAutopsies() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/autopsies`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, autopsies: [] };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), autopsies: [] };
  }
}

async function getPostflightHistory() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/postflights`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, postflights: [] };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), postflights: [] };
  }
}

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

async function getO2Status() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/o2-status`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

async function getO2Actions() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/o2-actions`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

async function getLatestBaselineDetail() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const hist = await fetch(`${base}/api/owner/baselines`, { cache: "no-store" });
    if (!hist.ok) return { ok: false, error: `HTTP ${hist.status}` };

    const histJson = await hist.json();
    const latest = histJson?.baselines?.[0]?.baseline;
    if (!latest) return { ok: true, detail: null };

    const res = await fetch(`${base}/api/owner/baseline-detail?baseline=${encodeURIComponent(latest)}`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}


async function getLatestBenchmark() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/benchmark/latest`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, summary: {}, results: [] };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), summary: {}, results: [] };
  }
}

async function getActiveNodes() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/active-nodes`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, nodes: [], count: 0 };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), nodes: [], count: 0 };
  }
}

async function getAp2Queue() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/ap2-queue`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

async function getChatMasterHealth() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/chat-master-health`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

async function getMemoryStatus() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/memory-status`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

async function getActionHistory() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/action-history`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, history: [] };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), history: [] };
  }
}

async function getGuardStatus() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/guard-status`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, guards: [] };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), guards: [] };
  }
}

async function getEnvironmentStatus() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/owner/environment-status`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, configured: {}, environment: {} };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), configured: {}, environment: {} };
  }
}

async function getOrchestratorStatus() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/hx2/orchestrator-status`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, orchestrator: null };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), orchestrator: null };
  }
}

async function getChatMasterStatus() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/hx2/chat-master-status`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, chat_master: null };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), chat_master: null };
  }
}

async function getChatMasterIntents() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/hx2/chat-master-intents`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, chat_master_intents: null };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), chat_master_intents: null };
  }
}

async function getChatMasterExecutionMap() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/hx2/chat-master-execution-map`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, execution_map: {}, intents: [] };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), execution_map: {}, intents: [] };
  }
}

async function getChatMasterKeywords() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {
    const res = await fetch(`${base}/api/hx2/chat-master-keywords`, { cache: "no-store" });

    if (!res.ok) {
      return {
        ok: false,
        error: `HTTP ${res.status}`,
        keywords: {},
        intents: []
      };
    }

    return await res.json();

  } catch (err: any) {

    return {
      ok: false,
      error: err?.message || String(err),
      keywords: {},
      intents: []
    };
  }
}

async function getChatMasterDiagnostics() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  try {

    const res = await fetch(
      `${base}/api/hx2/chat-master-diagnostics`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return {
        ok: false,
        diagnostics: [],
        intent_count: 0,
        error: `HTTP ${res.status}`
      };
    }

    return await res.json();

  } catch (err: any) {

    return {
      ok: false,
      diagnostics: [],
      intent_count: 0,
      error: err?.message || String(err)
    };
  }
}
function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-sm">
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-2 break-all text-sm text-white">{value || "not found"}</div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function LinkButton({ href, label }: { href?: string | null; label: string }) {
  if (!href) {
    return <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-500">{label}: unavailable</div>;
  }

  return (
    <a href={href} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white transition hover:bg-slate-800" target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}

function WarningBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${active ? "border-amber-700 bg-amber-950 text-amber-200" : "border-emerald-800 bg-emerald-950 text-emerald-200"}`}>
      {label}: {active ? "Attention needed" : "Clear"}
    </div>
  );
}

function StabilityBadge({ label, stable, values }: { label: string; stable: boolean; values: string[] }) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${stable ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-amber-700 bg-amber-950 text-amber-200"}`}>
      <div>{label}: {stable ? "Stable" : "Drifting"}</div>
      <div className="mt-1 text-xs opacity-80">{values.length ? values.join(", ") : "no data"}</div>
    </div>
  );
}

function FreshnessBadge({
  label,
  status,
  minutes,
}: {
  label: string;
  status: string;
  minutes: number | null;
}) {
  const style =
    status === "fresh"
      ? "border-emerald-800 bg-emerald-950 text-emerald-200"
      : status === "aging"
      ? "border-amber-700 bg-amber-950 text-amber-200"
      : "border-red-800 bg-red-950 text-red-200";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${style}`}>
      <div>{label}: {status || "unknown"}</div>
      <div className="mt-1 text-xs opacity-80">
        {minutes !== null && minutes !== undefined ? `${minutes} min ago` : "unknown"}
      </div>
    </div>
  );
}



function ActiveNodesPanel({ activeNodes }: { activeNodes: any }) {
  const nodes = Array.isArray(activeNodes?.nodes) ? activeNodes.nodes : [];
  const count = activeNodes?.count ?? nodes.length;
  const ok = activeNodes?.ok === true;

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Active HX2 Nodes</h2>
          <p className="mt-1 text-sm text-slate-400">Currently reported active nodes from the owner active-nodes rail.</p>
        </div>
        <div className={`rounded-xl border px-4 py-2 text-sm ${ok ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-amber-700 bg-amber-950 text-amber-200"}`}>
          {ok ? `${count} Active` : "Unavailable"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Node Count" value={count} />
        <StatCard title="Status" value={ok ? "Online" : "Unavailable"} />
        <StatCard title="Source" value="owner:active_nodes" />
      </div>

      <div className="mt-4 overflow-x-auto">
        {nodes.length === 0 ? (
          <div className="text-sm text-slate-500">No active node data available.</div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="py-2 pr-4">Node</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Mode</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node: any, idx: number) => (
                <tr key={`${node?.node_id || node?.id || idx}`} className="border-t border-slate-800">
                  <td className="py-2 pr-4 text-white">{node?.node_id || node?.id || node?.name || "unknown"}</td>
                  <td className="py-2 pr-4 text-slate-300">{node?.status || node?.state || "active"}</td>
                  <td className="py-2 pr-4 text-slate-300">{node?.mode || node?.registry_status || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Ap2QueuePanel({ ap2 }: { ap2: any }) {
  const ok = ap2?.ok === true;
  const status = ap2?.queue_status || {};

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">AP2 Queue / Worker Status</h2>
          <p className="mt-1 text-sm text-slate-400">Live owner summary from the AP2 gateway status endpoint.</p>
        </div>
        <div className={`rounded-xl border px-4 py-2 text-sm ${ok ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-red-800 bg-red-950 text-red-200"}`}>
          {ok ? "Reachable" : "Attention Needed"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Gateway" value={ap2?.gateway || "unknown"} />
        <StatCard title="HTTP Status" value={ap2?.http_status ?? "unknown"} />
        <StatCard title="Checked UTC" value={ap2?.checked_utc || "unknown"} />
      </div>

      <pre className="mt-4 max-h-72 overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300">
        {JSON.stringify(status, null, 2)}
      </pre>
    </div>
  );
}

function ChatMasterHealthPanel({ health }: { health: any }) {
  const ok = health?.ok === true;

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Chat-Master Health</h2>
          <p className="mt-1 text-sm text-slate-400">Live test of the master chat orchestration endpoint.</p>
        </div>
        <div className={`rounded-xl border px-4 py-2 text-sm ${ok ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-red-800 bg-red-950 text-red-200"}`}>
          {ok ? "Reachable" : "Failing"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <StatCard title="HTTP Status" value={health?.http_status ?? "unknown"} />
        <StatCard title="Latency" value={`${health?.latency_ms ?? 0} ms`} />
        <StatCard title="Mode" value={health?.mode || "unknown"} />
        <StatCard title="Version" value={health?.chat_master_version || "unknown"} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Card title="Display Node" value={health?.display_node?.node_label || health?.display_node?.node_id || "unknown"} />
        <Card title="Checked UTC" value={health?.checked_utc || "unknown"} />
      </div>

      {!ok ? (
        <div className="mt-4 rounded-xl border border-red-800 bg-red-950 p-4 text-sm text-red-200">
          {health?.error || "Chat-master health check failed."}
        </div>
      ) : null}
    </div>
  );
}

function MemoryStatusPanel({ memory }: { memory: any }) {
  const ok = memory?.ok === true;
  const status = memory?.memory_status || {};

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Memory / Workspace Status</h2>
          <p className="mt-1 text-sm text-slate-400">Owner-console view of the brain memory continuity endpoint.</p>
        </div>
        <div className={`rounded-xl border px-4 py-2 text-sm ${ok ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-amber-700 bg-amber-950 text-amber-200"}`}>
          {ok ? "Reachable" : "Attention Needed"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <StatCard title="HTTP Status" value={memory?.http_status ?? "unknown"} />
        <StatCard title="Upstream" value={memory?.upstream_status ?? "unknown"} />
        <StatCard title="Latency" value={`${memory?.latency_ms ?? 0} ms`} />
        <StatCard title="Forwarded" value={memory?.forwarded ? "true" : "false"} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Card title="Memory URL" value={memory?.url || "unknown"} />
        <Card title="Checked UTC" value={memory?.checked_utc || "unknown"} />
      </div>

      <pre className="mt-4 max-h-72 overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300">
        {JSON.stringify(status, null, 2)}
      </pre>
    </div>
  );
}

function RecentActionsPanel({ actionHistory }: { actionHistory: any }) {
  const history = Array.isArray(actionHistory?.history) ? actionHistory.history : [];
  const latest = history[0] || null;

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Recent Owner Actions</h2>
          <p className="mt-1 text-sm text-slate-400">Latest owner-console operational actions from Redis history.</p>
        </div>
        <div className={`rounded-xl border px-4 py-2 text-sm ${history.length ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-slate-700 bg-slate-950 text-slate-300"}`}>
          {history.length ? `${history.length} Loaded` : "No History"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="History Count" value={history.length} />
        <StatCard title="Latest Action" value={latest?.action || latest?.task_type || "none"} />
        <StatCard title="Latest Result" value={latest ? (latest?.ok ? "Success" : "Failed") : "none"} />
      </div>

      <div className="mt-4 overflow-x-auto">
        {history.length === 0 ? (
          <div className="text-sm text-slate-500">No recent owner action history available.</div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Result</th>
                <th className="py-2 pr-4">Task State</th>
                <th className="py-2 pr-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 8).map((item: any, idx: number) => (
                <tr key={`${item?.action || item?.task_type || "action"}-${idx}`} className="border-t border-slate-800">
                  <td className="py-2 pr-4 text-white">{item?.action || item?.task_type || "unknown"}</td>
                  <td className="py-2 pr-4 text-slate-300">{item?.ok === true ? "success" : item?.ok === false ? "failed" : "unknown"}</td>
                  <td className="py-2 pr-4 text-slate-300">{item?.task_state || item?.state || "-"}</td>
                  <td className="py-2 pr-4 text-slate-300">{item?.ts || item?.time || item?.created_at || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ReleaseDeploySummaryPanel({
  summary,
  releases,
  latestRelease,
}: {
  summary: any;
  releases: any[];
  latestRelease: any;
}) {
  const releaseCount = Array.isArray(releases) ? releases.length : 0;
  const hasLatest = !!latestRelease;

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Release / Deploy Summary</h2>
          <p className="mt-1 text-sm text-slate-400">Current release-note and deploy artifact visibility.</p>
        </div>
        <div className={`rounded-xl border px-4 py-2 text-sm ${hasLatest ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-amber-700 bg-amber-950 text-amber-200"}`}>
          {hasLatest ? "Release Found" : "No Release Found"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <StatCard title="Release Files" value={releaseCount} />
        <StatCard title="Latest Release" value={latestRelease?.file || "none"} />
        <StatCard title="Release Freshness" value={summary?.release_note_freshness || "unknown"} />
        <StatCard title="Postflight" value={summary?.last_postflight_status || "unknown"} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Card title="Deploy Log" value={summary?.deploy_log || "not found"} />
        <Card title="Latest Modified" value={latestRelease?.modified_at || "unknown"} />
      </div>
    </div>
  );
}

function ControlHubPanel() {
  return (
    <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Owner Control Hub</h2>
          <p className="mt-1 text-sm text-slate-400">Fast access to the most-used HX2 owner surfaces.</p>
        </div>
        <div className="rounded-xl border border-emerald-800 bg-emerald-950 px-4 py-2 text-sm text-emerald-200">
          Operational
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LinkButton href="/owner-console/actions" label="Owner Actions" />
        <LinkButton href="/owner-console/baseline" label="Baseline Explorer" />
        <LinkButton href="/owner-console/release" label="Release View" />
        <LinkButton href="/chat" label="Master Chat" />
        <LinkButton href="/oi/status" label="OI Status" />
        <LinkButton href="/api/owner/benchmark/latest" label="Benchmark API" />
        <LinkButton href="/api/ap2/status" label="AP2 Status" />
        <LinkButton href="/api/owner/chat-master-health" label="Chat-Master Health" />
      </div>
    </div>
  );
}



function BuildModesPanel() {
  const modes = [
    {
      name: "hx2:quick",
      purpose: "Fast iteration validation"
    },
    {
      name: "hx2:guard",
      purpose: "Full system guard validation"
    },
    {
      name: "hx2:orchestrator:guard",
      purpose: "Orchestrator-only validation"
    },
    {
      name: "hx2:chat-master:guard",
      purpose: "Chat Master validation"
    },
    {
      name: "hx2:chat-master:report",
      purpose: "Chat Master readiness report"
    },
    {
      name: "hx2:chat-master:route-report",
      purpose: "Chat Master route test URLs"
    },
    {
      name: "hx2:timing",
      purpose: "Measure validation speed"
    },
    {
      name: "hx2:env",
      purpose: "Local environment visibility"
    }
  ];

  return (
    <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div>
        <h2 className="text-lg font-semibold">Build Modes</h2>
        <p className="mt-1 text-sm text-slate-400">
          Recommended validation workflows by development stage.
        </p>
      </div>

      <div className="mt-4 space-y-2">
        {modes.map((mode) => (
          <div
            key={mode.name}
            className="rounded-xl border border-slate-700 bg-slate-950 p-3"
          >
            <div className="font-mono text-cyan-300">
              npm run {mode.name}
            </div>

            <div className="mt-1 text-sm text-slate-400">
              {mode.purpose}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickCommandsPanel() {
  const commands = [
    "npm run hx2:quick",
    "npm run hx2:guard",
    "npm run hx2:timing",
    "npm run hx2:env",
    "npm run hx2:orchestrator:guard",
    "npm run hx2:orchestrator:report"
  ];

  return (
    <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Quick Developer Commands</h2>
          <p className="mt-1 text-sm text-slate-400">
            Common HX2 validation and orchestration workflows.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Reference: docs/HX2_VERIFY_MODES.md
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {commands.map((cmd) => (
          <div
            key={cmd}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-cyan-300"
          >
            {cmd}
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemSnapshotHeader({
  benchmark,
  chatMaster,
  ap2,
  memory,
  activeNodes,
  checks,
  orchestrator,
}: {
  benchmark: any;
  chatMaster: any;
  ap2: any;
  memory: any;
  activeNodes: any;
  checks: any[];
  orchestrator: any;
}) {
  const benchmarkScore = benchmark?.summary?.AverageScore ?? "unknown";
  const chatOk = chatMaster?.ok === true;
  const ap2Ok = ap2?.ok === true;
  const memoryOk = memory?.ok === true;
  const nodeCount = activeNodes?.count ?? (Array.isArray(activeNodes?.nodes) ? activeNodes.nodes.length : 0);
  const failingChecks = Array.isArray(checks) ? checks.filter((x) => !x.ok).length : 0;
  const orch = orchestrator?.orchestrator || {};
  const orchSeverity = String(orch?.severity || "unknown");
  const orchReadiness = Number(orch?.readiness_percent ?? 0);
  const orchCritical = Number(orch?.critical_readiness_percent ?? 0);
  const orchMissingCritical = Array.isArray(orch?.missing_critical) ? orch.missing_critical : [];
  const orchMissingOptional = Array.isArray(orch?.missing_optional) ? orch.missing_optional : [];

  const remediationMap: Record<string, string> = {
    redis_configured: "Configure Upstash Redis environment variables.",
    ap2_gateway_configured: "Verify AP2_GATEWAY_URL is configured.",
    chat_master_route: "Restore /api/hx2/chat-master route.",
    router_route: "Restore /api/hx2/router route.",
    execute_route: "Restore /api/hx2/execute route.",
    owner_console: "Restore owner console page.",
    registry_preview_route: "Restore registry preview route.",
    memory_status_route: "Restore brain memory status route."
  };

  const criticalRemediationItems = orchMissingCritical.map((key: string) => ({
    key,
    action: remediationMap[key] || "Review this missing critical orchestration check."
  }));

  const optionalRemediationItems = orchMissingOptional.map((key: string) => ({
    key,
    action: remediationMap[key] || "Review this missing optional orchestration check."
  }));

  const remediationItems = [...criticalRemediationItems, ...optionalRemediationItems];

  const snapshotTone =
    orchSeverity === "healthy"
      ? "border-emerald-800 bg-emerald-950/40"
      : orchSeverity === "degraded"
      ? "border-amber-700 bg-amber-950/40"
      : "border-red-800 bg-red-950/40";

  const orchestrationRecommendation =
    orchSeverity === "healthy"
      ? `System operational — readiness ${orchReadiness}%, critical ${orchCritical}%.`
      : orchSeverity === "degraded"
      ? `Review optional orchestration services — readiness ${orchReadiness}%, missing optional ${orchMissingOptional.length}.`
      : `Immediate orchestration attention required — readiness ${orchReadiness}%, missing critical ${orchMissingCritical.length}.`;

  return (
    <div className={`mt-6 rounded-2xl border p-5 ${snapshotTone}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">System Snapshot</h2>
          <p className="mt-1 text-sm text-slate-400">At-a-glance operational health for HX2 owner control.</p>
        </div>
        <div className={`rounded-xl border px-4 py-2 text-sm ${
          chatOk && ap2Ok && memoryOk && failingChecks === 0
            ? "border-emerald-800 bg-emerald-950 text-emerald-200"
            : "border-amber-700 bg-amber-950 text-amber-200"
        }`}>
          {
            orchSeverity === "healthy" && chatOk && ap2Ok && memoryOk && failingChecks === 0
              ? "Operational"
              : orchSeverity === "degraded"
              ? "Degraded"
              : "Critical"
          }
        </div>
      </div>

      {remediationItems.length > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-700 bg-amber-950 p-4 text-sm text-amber-200">
          <div className="font-semibold">Recommended Remediation</div>

          {criticalRemediationItems.length > 0 ? (
            <div className="mt-3 rounded-lg border border-red-800 bg-red-950 p-3 text-red-200">
              <div className="font-semibold">Critical Remediation</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {criticalRemediationItems.map((item) => (
                  <li key={item.key}>{item.key}: {item.action}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {optionalRemediationItems.length > 0 ? (
            <div className="mt-3 rounded-lg border border-amber-700 bg-amber-950 p-3 text-amber-200">
              <div className="font-semibold">Optional Remediation</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {optionalRemediationItems.map((item) => (
                  <li key={item.key}>{item.key}: {item.action}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-9">
        <StatCard title="Benchmark" value={benchmarkScore} />
        <StatCard title="Chat-Master" value={chatOk ? "Online" : "Issue"} />
        <StatCard title="AP2" value={ap2Ok ? "Online" : "Issue"} />
        <StatCard title="Memory" value={memoryOk ? "Online" : "Issue"} />
        <StatCard title="Active Nodes" value={nodeCount} />
        <StatCard title="Endpoint Fails" value={failingChecks} />
        <StatCard title="Orch Severity" value={orchSeverity} />
        <StatCard title="Orch Ready" value={`${orchReadiness}%`} />
        <StatCard title="Orch Critical" value={`${orchCritical}%`} />
        <StatCard
          title="Chat Master Ready"
          value={orchCritical === 100 ? "Yes" : "Partial"}
        />
        <StatCard title="Critical Fixes" value={criticalRemediationItems.length} />
        <StatCard title="Optional Fixes" value={optionalRemediationItems.length} />
      </div>
    </div>
  );
}


function CommandReferencePanel() {
  const commands = [
    { label: "Master Guard", command: "npm run hx2:guard" },
    { label: "Verify Build + Guard", command: "npm run hx2:verify" },
    { label: "Build Only", command: "npm run build" },
    { label: "Safe Deploy", command: "npm run hx2:ship" },
    { label: "Auto Ship", command: "npm run hx2:ship:auto" },
  ];

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div>
        <h2 className="text-lg font-semibold">Build / Deploy Command Reference</h2>
        <p className="mt-1 text-sm text-slate-400">Canonical commands for verified HX2 operation.</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {commands.map((item) => (
          <div key={item.command} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-sm text-slate-400">{item.label}</div>
            <code className="mt-2 block break-all text-sm text-emerald-200">{item.command}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnvironmentStatusPanel({ envStatus }: { envStatus: any }) {
  const configured = envStatus?.configured || {};
  const env = envStatus?.environment || {};
  const keys = Object.keys(configured);
  const missing = keys.filter((k) => !configured[k]);

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Environment Status</h2>
          <p className="mt-1 text-sm text-slate-400">Safe boolean-only visibility. Secret values are never shown.</p>
        </div>
        <div className={`rounded-xl border px-4 py-2 text-sm ${missing.length === 0 ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-amber-700 bg-amber-950 text-amber-200"}`}>
          {missing.length === 0 ? "Configured" : `${missing.length} Missing`}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <StatCard title="NODE_ENV" value={env?.node_env || "unknown"} />
        <StatCard title="Vercel" value={env?.vercel ? "true" : "false"} />
        <StatCard title="Vercel Env" value={env?.vercel_env || "local/unknown"} />
        <StatCard title="Missing Keys" value={missing.length} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {keys.map((k) => (
          <div key={k} className={`rounded-xl border px-4 py-3 text-sm ${configured[k] ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-amber-700 bg-amber-950 text-amber-200"}`}>
            {k}: {configured[k] ? "set" : "missing"}
          </div>
        ))}
      </div>
    </div>
  );
}
function GuardStatusPanel({ guardStatus }: { guardStatus: any }) {
  const guards = Array.isArray(guardStatus?.guards) ? guardStatus.guards : [];
  const missing = guards.filter((g: any) => !g.exists);

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">HX2 Guard Status</h2>
          <p className="mt-1 text-sm text-slate-400">Canonical verification chain protecting future sprints and deploys.</p>
        </div>
        <div className={`rounded-xl border px-4 py-2 text-sm ${missing.length === 0 ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-red-800 bg-red-950 text-red-200"}`}>
          {missing.length === 0 ? "Guarded" : `${missing.length} Missing`}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Command" value={guardStatus?.command || "npm run hx2:guard"} />
        <StatCard title="Guards" value={guards.length} />
        <StatCard title="Missing" value={missing.length} />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="py-2 pr-4">Guard</th>
              <th className="py-2 pr-4">Exists</th>
            </tr>
          </thead>
          <tbody>
            {guards.map((g: any) => (
              <tr key={g.guard} className="border-t border-slate-800">
                <td className="py-2 pr-4 text-white">{g.guard}</td>
                <td className="py-2 pr-4 text-slate-300">{g.exists ? "true" : "false"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}






function ChatMasterDiagnosticsPanel({ data }: { data: any }) {

  const diagnostics =
    data?.diagnostics || [];

  const sampleQueries =
    data?.sample_queries || [];

  const confidence =
    data?.confidence_distribution || {};

  const averageConfidence =
    data?.average_confidence || "0.00";

  const routingMaturity =
    data?.routing_maturity || "unknown";

  const routingMaturityTone =
    routingMaturity === "advanced"
      ? "border-emerald-700 bg-emerald-950 text-emerald-300"
      : routingMaturity === "intermediate"
      ? "border-amber-700 bg-amber-950 text-amber-300"
      : "border-slate-700 bg-slate-950 text-slate-300";




  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">

      <div>
        <h2 className="text-lg font-semibold">
          Chat Master Diagnostics
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Runtime routing visibility and keyword coverage.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">

        <StatCard
          title="Diagnostics"
          value={data?.ok ? "Available" : "Issue"}
        />

        <StatCard
          title="Intent Count"
          value={data?.intent_count ?? 0}
        />

        <StatCard
          title="Diagnostic Rows"
          value={diagnostics.length}
        />

        <StatCard
          title="Sample Queries"
          value={sampleQueries.length}
        />

        <StatCard
          title="High Confidence"
          value={confidence.high_confidence ?? 0}
        />

        <StatCard
          title="Medium Confidence"
          value={confidence.medium_confidence ?? 0}
        />

        <StatCard
          title="Low Confidence"
          value={confidence.low_confidence ?? 0}
        />

        <StatCard
          title="Average Confidence"
          value={averageConfidence}
        />

        <div className={`rounded-xl border p-4 ${routingMaturityTone}`}>
          <div className="text-xs uppercase tracking-wide opacity-70">
            Routing Maturity
          </div>

          <div className="mt-2 text-xl font-semibold">
            {routingMaturity}
          </div>
        </div>

      </div>

      <div className="mt-4 space-y-3">

        {diagnostics.map((row: any) => (

          <div
            key={row.intent}
            className="rounded-xl border border-slate-700 bg-slate-950 p-4"
          >

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div>
                <div className="font-mono text-sm text-cyan-300">
                  {row.intent}
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  Execution Target: {row.execution_target}
                </div>
              </div>

              <div className="rounded-full border border-cyan-800 bg-cyan-950 px-3 py-1 text-xs text-cyan-200">
                {row.keyword_count} keywords
              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
function ChatMasterKeywordsPanel({ data }: { data: any }) {

  const keywords =
    data?.keywords || {};

  const intents =
    data?.intents || [];

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">

      <div>
        <h2 className="text-lg font-semibold">
          Chat Master Keywords
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Centralized routing keyword contracts.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Keyword Status"
          value={data?.ok ? "Available" : "Issue"}
        />

        <StatCard
          title="Intent Count"
          value={intents.length}
        />

        <StatCard
          title="Keyword Groups"
          value={Object.keys(keywords).length}
        />
      </div>

      <div className="mt-4 space-y-3">

        {intents.map((intent: string) => (

          <div
            key={intent}
            className="rounded-xl border border-slate-700 bg-slate-950 p-4"
          >

            <div className="font-mono text-sm text-cyan-300">
              {intent}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">

              {(keywords?.[intent] || []).map((k: string) => (
                <span
                  key={k}
                  className="rounded-full border border-cyan-800 bg-cyan-950 px-2 py-1 text-xs text-cyan-200"
                >
                  {k}
                </span>
              ))}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
function ChatMasterExecutionMapPanel({ data }: { data: any }) {
  const map = data?.execution_map || {};
  const intents = data?.intents || Object.keys(map || {});

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div>
        <h2 className="text-lg font-semibold">Chat Master Execution Map</h2>
        <p className="mt-1 text-sm text-slate-400">Current intent-to-node routing targets.</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Map Status" value={data?.ok ? "Available" : "Issue"} />
        <StatCard title="Intent Count" value={intents.length} />
        <StatCard title="Routing Targets" value={Object.keys(map).length} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {intents.map((intent: string) => (
          <div key={intent} className="rounded-xl border border-slate-700 bg-slate-950 p-4">
            <div className="font-mono text-sm text-cyan-300">{intent}</div>
            <div className="mt-2 text-sm text-white">Node: {map?.[intent]?.node || "unknown"}</div>
            <div className="mt-1 text-xs text-slate-400">{map?.[intent]?.description || "No description"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function ChatMasterIntentsPanel({ data }: { data: any }) {
  const intents = data?.chat_master_intents?.intents || [];
  const status = data?.chat_master_intents?.status || "unknown";

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div>
        <h2 className="text-lg font-semibold">Chat Master Intents</h2>
        <p className="mt-1 text-sm text-slate-400">Available routing intents for unified HX2 orchestration.</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Status" value={status} />
        <StatCard title="Intent Count" value={intents.length} />
        <StatCard title="Routing Contract" value={intents.length > 0 ? "Available" : "Missing"} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {intents.map((intent: string) => (
          <span key={intent} className="rounded-full border border-cyan-800 bg-cyan-950 px-3 py-1 text-sm text-cyan-200">
            {intent}
          </span>
        ))}
      </div>
    </div>
  );
}
function ChatMasterStatusPanel({ status }: { status: any }) {
  const chat = status?.chat_master || {};
  const checks = chat?.checks || {};
  const readiness = Number(chat?.readiness_percent ?? 0);
  const ok = status?.ok === true && readiness === 100;

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Chat Master Status</h2>
          <p className="mt-1 text-sm text-slate-400">Unified HX2 routing foundation readiness.</p>
        </div>
        <div className={`rounded-xl border px-4 py-2 text-sm ${ok ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-amber-700 bg-amber-950 text-amber-200"}`}>
          {ok ? "Ready" : "Partial"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Readiness" value={`${readiness}%`} />
        <StatCard title="Healthy Checks" value={chat?.healthy_checks ?? 0} />
        <StatCard title="Total Checks" value={chat?.total_checks ?? 0} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Object.keys(checks).map((key) => (
          <div key={key} className={`rounded-xl border px-4 py-3 text-sm ${checks[key] ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-amber-700 bg-amber-950 text-amber-200"}`}>
            {key}: {checks[key] ? "true" : "false"}
          </div>
        ))}
      </div>
    </div>
  );
}
function OrchestratorStatusPanel({ status }: { status: any }) {
  const orchestrator = status?.orchestrator || {};
  const checks = orchestrator?.checks || {};
  const total = orchestrator?.total_checks ?? Object.keys(checks).length;
  const healthy = orchestrator?.healthy_checks ?? Object.values(checks).filter(Boolean).length;
  const missingRoutes = Array.isArray(orchestrator?.missing_routes) ? orchestrator.missing_routes : [];
  const readiness = Number(orchestrator?.readiness_percent ?? (total > 0 ? Math.round((healthy / total) * 100) : 0));
  const severity = String(orchestrator?.severity || "unknown");
  const criticalReadiness = Number(orchestrator?.critical_readiness_percent ?? readiness);
  const optionalReadiness = Number(orchestrator?.optional_readiness_percent ?? readiness);
  const missingCritical = Array.isArray(orchestrator?.missing_critical) ? orchestrator.missing_critical : [];
  const missingOptional = Array.isArray(orchestrator?.missing_optional) ? orchestrator.missing_optional : [];
  const readinessTone =
    readiness >= 90
      ? "border-emerald-800 bg-emerald-950 text-emerald-200"
      : readiness >= 70
      ? "border-amber-700 bg-amber-950 text-amber-200"
      : "border-red-800 bg-red-950 text-red-200";
  const criticalTone =
    criticalReadiness === 100
      ? "border-emerald-800 bg-emerald-950 text-emerald-200"
      : "border-red-800 bg-red-950 text-red-200";
  const optionalTone =
    optionalReadiness >= 70
      ? "border-emerald-800 bg-emerald-950 text-emerald-200"
      : "border-amber-700 bg-amber-950 text-amber-200";
  const severityTone =
    severity === "healthy"
      ? "border-emerald-800 bg-emerald-950 text-emerald-200"
      : severity === "degraded"
      ? "border-amber-700 bg-amber-950 text-amber-200"
      : "border-red-800 bg-red-950 text-red-200";
    severity === "healthy"
      ? "border-emerald-800 bg-emerald-950 text-emerald-200"
      : severity === "degraded"
      ? "border-amber-700 bg-amber-950 text-amber-200"
      : "border-red-800 bg-red-950 text-red-200";
  const ok = status?.ok === true && healthy === total && missingRoutes.length === 0;

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">HX2 Orchestrator Status</h2>
          <p className="mt-1 text-sm text-slate-400">Centralized orchestration readiness and routing foundation visibility.</p>
        </div>
        <div className={`rounded-xl border px-4 py-2 text-sm ${ok ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-amber-700 bg-amber-950 text-amber-200"}`}>
          {ok ? "Ready" : "Review Needed"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <StatCard title="Phase" value={orchestrator?.phase || "unknown"} />
        <StatCard title="Healthy Checks" value={healthy} />
        <StatCard title="Total Checks" value={total} />
        <StatCard title="Status" value={ok ? "Ready" : "Partial"} />
        <div className={`rounded-2xl border p-4 ${severityTone}`}>
          <div className="text-sm opacity-80">Severity</div>
          <div className="mt-2 text-2xl font-semibold capitalize">{severity}</div>
        </div>
        <StatCard title="Missing" value={missingRoutes.length} />
        <div className={`rounded-2xl border p-4 ${readinessTone}`}>
          <div className="text-sm opacity-80">Readiness</div>
          <div className="mt-2 text-2xl font-semibold">{readiness}%</div>
        </div>
        <div className={`rounded-2xl border p-4 ${criticalTone}`}>
          <div className="text-sm opacity-80">Critical Readiness</div>
          <div className="mt-2 text-2xl font-semibold">{criticalReadiness}%</div>
        </div>
        <div className={`rounded-2xl border p-4 ${optionalTone}`}>
          <div className="text-sm opacity-80">Optional Readiness</div>
          <div className="mt-2 text-2xl font-semibold">{optionalReadiness}%</div>
        </div>
        <StatCard title="Missing Critical" value={missingCritical.length} />
        <StatCard title="Missing Optional" value={missingOptional.length} />
        <StatCard
          title="Chat Master Foundation"
          value={checks.chat_master_foundation ? "Ready" : "Missing"}
        />
      </div>

      {missingRoutes.length > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-700 bg-amber-950 p-4 text-sm text-amber-200">
          Missing orchestrator checks: {missingRoutes.join(", ")}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Object.keys(checks).map((key) => (
          <div key={key} className={`rounded-xl border px-4 py-3 text-sm ${checks[key] ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-amber-700 bg-amber-950 text-amber-200"}`}>
            {key}: {checks[key] ? "true" : "false"}
          </div>
        ))}
      </div>
    </div>
  );
}
function BenchmarkStatusPanel({ benchmark }: { benchmark: any }) {
  const summary = benchmark?.summary || {};
  const results = Array.isArray(benchmark?.results) ? benchmark.results : [];
  const weakest = benchmark?.weakest || null;
  const overallPassed = summary?.OverallPassed === true;
  const tone = overallPassed ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-red-800 bg-red-950 text-red-200";

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">HX2 Benchmark Status</h2>
          <p className="mt-1 text-sm text-slate-400">Latest core benchmark result from hx2-last-benchmark.json.</p>
        </div>
        <div className={`rounded-xl border px-4 py-2 text-sm ${tone}`}>
          {overallPassed ? "Passing" : "Needs Attention"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <StatCard title="Average Score" value={summary?.AverageScore ?? "unknown"} />
        <StatCard title="Passed" value={summary?.Passed || "unknown"} />
        <StatCard title="Overall" value={overallPassed ? "True" : "False"} />
        <StatCard title="Weakest Test" value={weakest?.Test ? `${weakest.Test}: ${weakest.Score}` : "none"} />
      </div>

      <div className="mt-4 text-xs text-slate-500">
        Generated UTC: {benchmark?.generated_utc || "unknown"}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="py-2 pr-4">Test</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2 pr-4">Passed</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r: any) => (
              <tr key={r.Test} className="border-t border-slate-800">
                <td className="py-2 pr-4 text-white">{r.Test}</td>
                <td className="py-2 pr-4 text-white">{r.Score}</td>
                <td className="py-2 pr-4 text-slate-300">{r.Passed ? "true" : "false"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SystemHealthSummaryPanel({ checks }: { checks: any[] }) {
  const total = Array.isArray(checks) ? checks.length : 0;
  const passing = Array.isArray(checks) ? checks.filter((x) => !!x.ok).length : 0;
  const failing = total - passing;
  const avgLatency =
    total > 0
      ? Math.round(checks.reduce((sum, x) => sum + Number(x?.latency_ms || 0), 0) / total)
      : 0;

  const tone = failing === 0 ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-amber-700 bg-amber-950 text-amber-200";

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Live System Health</h2>
          <p className="mt-1 text-sm text-slate-400">Owner-visible API and endpoint health summary.</p>
        </div>
        <div className={`rounded-xl border px-4 py-2 text-sm ${tone}`}>
          {failing === 0 ? "Healthy" : `${failing} Attention`}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <StatCard title="Endpoints Checked" value={total} />
        <StatCard title="Passing" value={passing} />
        <StatCard title="Failing" value={failing} />
        <StatCard title="Avg Latency" value={`${avgLatency} ms`} />
      </div>
    </div>
  );
}
function HealthBadge({
  label,
  ok,
  status,
  latency,
}: {
  label: string;
  ok: boolean;
  status: number;
  latency: number;
}) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${ok ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-red-800 bg-red-950 text-red-200"}`}>
      <div>{label}: {ok ? "Healthy" : "Failing"}</div>
      <div className="mt-1 text-xs opacity-80">HTTP {status} · {latency} ms</div>
    </div>
  );
}

function PostflightBadge({
  status,
  minutes,
}: {
  status: string;
  minutes: number | null;
}) {
  const style =
    status === "fresh"
      ? "border-emerald-800 bg-emerald-950 text-emerald-200"
      : status === "aging"
      ? "border-amber-700 bg-amber-950 text-amber-200"
      : "border-red-800 bg-red-950 text-red-200";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${style}`}>
      <div>Last Postflight: {status || "unknown"}</div>
      <div className="mt-1 text-xs opacity-80">
        {minutes !== null && minutes !== undefined ? `${minutes} min ago` : "unknown"}
      </div>
    </div>
  );
}

function O2StateBadge({ state }: { state: string }) {
  const style =
    state === "green"
      ? "border-emerald-800 bg-emerald-950 text-emerald-200"
      : state === "degraded"
      ? "border-amber-700 bg-amber-950 text-amber-200"
      : "border-red-800 bg-red-950 text-red-200";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${style}`}>
      <div>O2 State: {state || "unknown"}</div>
    </div>
  );
}

export default async function OwnerConsolePage() {
  const data = await getOwnerSummary();
  const history = await getBaselineHistory();
  const health = await getOwnerHealth();
  const autopsyData = await getAutopsies();
  const postflightData = await getPostflightHistory();
  const releaseData = await getReleaseHistory();
  const o2Data = await getO2Status();
  const o2ActionsData = await getO2Actions();
  const baselineDetailData = await getLatestBaselineDetail();
  const benchmarkData = await getLatestBenchmark();
  const orchestratorStatusData = await getOrchestratorStatus();
  const chatMasterStatusData = await getChatMasterStatus();
  const chatMasterIntentsData = await getChatMasterIntents();
  const chatMasterExecutionMapData = await getChatMasterExecutionMap();
  const chatMasterKeywordsData = await getChatMasterKeywords();
  const chatMasterDiagnosticsData = await getChatMasterDiagnostics();
  const guardStatusData = await getGuardStatus();
  const environmentStatusData = await getEnvironmentStatus();
  const actionHistoryData = await getActionHistory();
  const memoryStatusData = await getMemoryStatus();
  const chatMasterHealthData = await getChatMasterHealth();
  const ap2QueueData = await getAp2Queue();
  const activeNodesData = await getActiveNodes();

  const summary = data?.summary || {};
  const preview = data?.release_note_preview || "";
  const baselines = history?.baselines || [];
  const stability = history?.stability || {};
  const checks = health?.checks || [];
  const autopsies = autopsyData?.autopsies || [];
  const latestAutopsy = autopsies.length > 0 ? autopsies[0] : null;
  const postflights = postflightData?.postflights || [];
  const releases = releaseData?.releases || [];
  const latestRelease = releases.length > 0 ? releases[0] : null;
  const o2State = o2Data?.state || "unknown";
  const o2Policy = o2Data?.policy || {};
  const o2Inputs = o2Data?.inputs || {};
  const o2Recommendations = o2ActionsData?.recommendations || [];
  const o2Cautions = o2ActionsData?.cautions || [];
  const detail = baselineDetailData?.detail || null;

  const hasStaging = (summary?.staging_count ?? 0) > 0;
  const hasIncomplete = (summary?.incomplete_count ?? 0) > 0;
  const hasAutopsy = (summary?.autopsy_count ?? 0) > 0;
  const missingReleaseNote = (summary?.release_note_count ?? 0) < 1;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold">HX2 Owner Console</h1>
        <p className="mt-2 text-sm text-slate-400">Owner-visible operational state for HX2.</p>

        <ControlHubPanel />

        <SystemSnapshotHeader benchmark={benchmarkData} chatMaster={chatMasterHealthData} ap2={ap2QueueData} memory={memoryStatusData} activeNodes={activeNodesData} checks={checks} orchestrator={orchestratorStatusData} />

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <WarningBadge label="Staging Folder" active={hasStaging} />
          <WarningBadge label="Incomplete Baselines" active={hasIncomplete} />
          <WarningBadge label="Recent Autopsy Exists" active={hasAutopsy} />
          <WarningBadge label="Release Note Missing" active={missingReleaseNote} />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <StabilityBadge label={`X2 Anchor Stability (${stability?.window_size ?? 0} recent)`} stable={!!stability?.x2_anchor_stable} values={stability?.x2_anchor_values || []} />
          <StabilityBadge label={`H2 Anchor Stability (${stability?.window_size ?? 0} recent)`} stable={!!stability?.h2_anchor_stable} values={stability?.h2_anchor_values || []} />
          <FreshnessBadge label="Baseline Freshness" status={summary?.baseline_freshness || "unknown"} minutes={summary?.baseline_age_minutes ?? null} />
          <FreshnessBadge label="Release Note Freshness" status={summary?.release_note_freshness || "unknown"} minutes={summary?.release_note_age_minutes ?? null} />
          <PostflightBadge status={summary?.last_postflight_status || "unknown"} minutes={summary?.last_postflight_age_minutes ?? null} />
        </div>

        <BenchmarkStatusPanel benchmark={benchmarkData} />

        <OrchestratorStatusPanel status={orchestratorStatusData} />

        <ChatMasterStatusPanel status={chatMasterStatusData} />

        <ChatMasterIntentsPanel data={chatMasterIntentsData} />

        <ChatMasterExecutionMapPanel data={chatMasterExecutionMapData} />

        <ChatMasterKeywordsPanel data={chatMasterKeywordsData} />

        <ChatMasterDiagnosticsPanel data={chatMasterDiagnosticsData} />

        <QuickCommandsPanel />

        <BuildModesPanel />

        <GuardStatusPanel guardStatus={guardStatusData} />

        <EnvironmentStatusPanel envStatus={environmentStatusData} />

        <CommandReferencePanel />

        <ReleaseDeploySummaryPanel summary={summary} releases={releases} latestRelease={latestRelease} />

        <RecentActionsPanel actionHistory={actionHistoryData} />

        <MemoryStatusPanel memory={memoryStatusData} />

        <ChatMasterHealthPanel health={chatMasterHealthData} />

        <Ap2QueuePanel ap2={ap2QueueData} />

        <ActiveNodesPanel activeNodes={activeNodesData} />

        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">O2 Status</h2>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <O2StateBadge state={o2State} />
              <div className="mt-4 text-sm text-slate-400">Description</div>
              <div className="mt-2 text-sm text-white">{o2Policy?.description || "No policy description available."}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-sm text-slate-400">Allowed Actions</div>
              <ul className="mt-2 space-y-1 text-sm text-emerald-200">
                {(o2Policy?.allow || []).map((x: string) => <li key={x}>• {x}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-sm text-slate-400">Denied Actions</div>
              <ul className="mt-2 space-y-1 text-sm text-red-200">
                {(o2Policy?.deny || []).map((x: string) => <li key={x}>• {x}</li>)}
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-sm text-slate-400">Inputs Driving State</div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">{JSON.stringify(o2Inputs, null, 2)}</pre>
          </div>
        </div>


        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">Baseline Detail Explorer</h2>
          {!detail ? (
            <div className="mt-4 text-sm text-slate-500">No baseline detail available.</div>
          ) : (
            <>
              <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <Card title="Baseline Folder" value={detail?.baseline || "not found"} />
                <Card title="X2 Anchor" value={detail?.x2_baseline?.anchor_source || "-"} />
                <Card title="H2 Anchor" value={detail?.h2_baseline?.anchor_source || "-"} />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <StatCard title="X2 Direct" value={detail?.x2_baseline?.catalyst_summary?.direct_catalysts?.length ?? 0} />
                <StatCard title="X2 Indirect" value={detail?.x2_baseline?.catalyst_summary?.indirect_backdrop?.length ?? 0} />
                <StatCard title="X2 Narrative" value={detail?.x2_baseline?.catalyst_summary?.narrative_support?.length ?? 0} />
                <StatCard title="H2 Direct" value={detail?.h2_baseline?.catalyst_summary?.direct_catalysts?.length ?? 0} />
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-sm text-slate-400">X2 Baseline Reply</div>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
                    {detail?.replies?.x2_baseline || "No X2 baseline reply available."}
                  </pre>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-sm text-slate-400">H2 Baseline Reply</div>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
                    {detail?.replies?.h2_baseline || "No H2 baseline reply available."}
                  </pre>
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-sm text-slate-400">X2 Mixed Reply</div>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
                    {detail?.replies?.x2_mixed || "No X2 mixed reply available."}
                  </pre>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-sm text-slate-400">H2 Cross Reply</div>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
                    {detail?.replies?.h2_cross || "No H2 cross reply available."}
                  </pre>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-sm text-slate-400">Manifest</div>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
                  {JSON.stringify(detail?.manifest || {}, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>


        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">O2 Action Console (Read Only)</h2>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-sm text-slate-400">Recommended Next Actions</div>
              <ul className="mt-3 space-y-2 text-sm text-emerald-200">
                {o2Recommendations.length === 0 ? (
                  <li>No recommendations available.</li>
                ) : (
                  o2Recommendations.map((x: string) => <li key={x}>• {x}</li>)
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-sm text-slate-400">Cautions / Blocks</div>
              <ul className="mt-3 space-y-2 text-sm text-amber-200">
                {o2Cautions.length === 0 ? (
                  <li>No cautions available.</li>
                ) : (
                  o2Cautions.map((x: string) => <li key={x}>• {x}</li>)
                )}
              </ul>
            </div>
          </div>
        </div>


        <SystemHealthSummaryPanel checks={checks} />

        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">Endpoint Health</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {checks.length === 0 ? (
              <div className="text-sm text-slate-500">No endpoint health data available.</div>
            ) : (
              checks.map((check: any) => (
                <HealthBadge key={check.url} label={check.url.split("/api/")[1] || check.url} ok={!!check.ok} status={check.status ?? 0} latency={check.latency_ms ?? 0} />
              ))
            )}
          </div>
        </div>


        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">Postflight History</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="px-3 py-2 text-left">Timestamp</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {postflights.length === 0 ? (
                  <tr><td className="px-3 py-3 text-slate-500" colSpan={2}>No postflight history available.</td></tr>
                ) : (
                  postflights.map((row: any, i: number) => (
                    <tr key={`${row.timestamp}-${i}`} className="border-b border-slate-800">
                      <td className="px-3 py-2">{row.timestamp || "-"}</td>
                      <td className="px-3 py-2">{row.status || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>


        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">Release History</h2>
          {latestRelease ? (
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-sm text-slate-400">Latest Release File</div>
                <div className="mt-2 text-sm text-white">{latestRelease.file}</div>
                <div className="mt-4 text-sm text-slate-400">Modified</div>
                <div className="mt-2 text-sm text-emerald-200">{latestRelease.modified_at || "unknown"}</div>
                <div className="mt-4">
                  <LinkButton href={latestRelease.path} label="Open Latest Release Note File" />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-sm text-slate-400">Latest Release Preview</div>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
                  {latestRelease.preview || "No release preview available."}
                </pre>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-500">No release history available.</div>
          )}
        </div>


        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">Autopsy Viewer</h2>
          {latestAutopsy ? (
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-sm text-slate-400">Latest Autopsy Folder</div>
                <div className="mt-2 text-sm text-white">{latestAutopsy.folder}</div>
                <div className="mt-4 text-sm text-slate-400">Reason</div>
                <div className="mt-2 text-sm text-amber-200">{latestAutopsy.reason || "unknown"}</div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <LinkButton href={latestAutopsy.files?.summary} label="Open Summary" />
                  <LinkButton href={latestAutopsy.files?.deploy_log} label="Open Deploy Log" />
                  <LinkButton href={latestAutopsy.files?.baseline_diff} label="Open Baseline Diff" />
                  <LinkButton href={latestAutopsy.files?.regression} label="Open Regression" />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-sm text-slate-400">Summary Preview</div>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
                  {latestAutopsy.summary_preview || "No summary preview available."}
                </pre>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-500">No autopsy records available.</div>
          )}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card title="Latest Baseline" value={summary?.latest_baseline || "not found"} />
          <Card title="Latest Release Note" value={summary?.latest_release_note || "not found"} />
          <Card title="Latest Autopsy" value={summary?.latest_autopsy || "none recorded"} />
          <Card title="Drift Dashboard" value={summary?.drift_dashboard || "not found"} />
          <Card title="Deploy Log" value={summary?.deploy_log || "not found"} />
          <Card title="Generated At" value={summary?.generated_at || "not found"} />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          <StatCard title="Baseline Count" value={summary?.baseline_count ?? 0} />
          <StatCard title="Release Note Count" value={summary?.release_note_count ?? 0} />
          <StatCard title="Autopsy Count" value={summary?.autopsy_count ?? 0} />
          <StatCard title="Staging Count" value={summary?.staging_count ?? 0} />
          <StatCard title="Incomplete Count" value={summary?.incomplete_count ?? 0} />
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-4">
          <LinkButton href="/owner-console/actions" label="Open Owner Actions" />
          <LinkButton href={summary?.latest_release_note} label="Open Latest Release Note" />
          <LinkButton href={summary?.drift_dashboard} label="Open Drift Dashboard" />
          <LinkButton href={summary?.deploy_log} label="Open Deploy Log" />
        </div>

        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">Latest Release Note Preview</h2>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
            {preview || "No release note preview available."}
          </pre>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">Baseline History</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="px-3 py-2 text-left">Baseline</th>
                  <th className="px-3 py-2 text-left">X2 Anchor</th>
                  <th className="px-3 py-2 text-left">H2 Anchor</th>
                  <th className="px-3 py-2 text-left">X2 Direct</th>
                  <th className="px-3 py-2 text-left">H2 Direct</th>
                  <th className="px-3 py-2 text-left">X2 Indirect</th>
                  <th className="px-3 py-2 text-left">X2 Narrative</th>
                  <th className="px-3 py-2 text-left">H2 Narrative</th>
                </tr>
              </thead>
              <tbody>
                {baselines.length === 0 ? (
                  <tr><td className="px-3 py-3 text-slate-500" colSpan={8}>No baseline history available.</td></tr>
                ) : (
                  baselines.map((row: any) => (
                    <tr key={row.baseline} className="border-b border-slate-800">
                      <td className="px-3 py-2">
                        <a
                          href={`/owner-console/baseline?baseline=${encodeURIComponent(row.baseline)}`}
                          className="text-emerald-300 hover:text-emerald-200 underline underline-offset-4"
                        >
                          {row.baseline}
                        </a>
                      </td>
                      <td className="px-3 py-2">{row.x2_anchor || "-"}</td>
                      <td className="px-3 py-2">{row.h2_anchor || "-"}</td>
                      <td className="px-3 py-2">{row.x2_direct_count}</td>
                      <td className="px-3 py-2">{row.h2_direct_count}</td>
                      <td className="px-3 py-2">{row.x2_indirect_count}</td>
                      <td className="px-3 py-2">{row.x2_narrative_count}</td>
                      <td className="px-3 py-2">{row.h2_narrative_count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}































































