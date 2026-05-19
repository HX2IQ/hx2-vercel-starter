import { CapabilityPlannerPreviewPanel } from "./capability-planner-panel";

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL?.startsWith("http")
      ? process.env.VERCEL_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"
  );
}

async function fetchJson(path: string, fallback: any) {
  try {
    const base = getBaseUrl();
    const res = await fetch(`${base}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return await res.json();
  } catch (err: any) {
    return { ...fallback, ok: false, error: err?.message || "fetch failed" };
  }
}

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-xl font-semibold text-white">{String(value)}</div>
    </div>
  );
}

async function getChatMasterStatus() {
  return fetchJson("/api/hx2/chat-master-status", { ok: false, chat_master: {} });
}

async function getChatMasterIntents() {
  return fetchJson("/api/hx2/chat-master-intents", { ok: false, chat_master_intents: { intents: [] } });
}

async function getChatMasterExecutionMap() {
  return fetchJson("/api/hx2/chat-master-execution-map", { ok: false, execution_map: {}, intents: [] });
}

async function getChatMasterKeywords() {
  return fetchJson("/api/hx2/chat-master-keywords", { ok: false, keywords: {}, intents: [] });
}

async function getChatMasterDiagnostics() {
  return fetchJson("/api/hx2/chat-master-diagnostics", {
    ok: false,
    diagnostics: [],
    sample_queries: [],
    confidence_distribution: {},
    routing_maturity: "unknown"
  });
}

async function getChatMasterReadiness() {
  return fetchJson("/api/hx2/chat-master-readiness", {
    ok: false,
    readiness_tier: "unknown",
    routing_maturity: "unknown",
    route_coverage_percent: 0,
    diagnostics_coverage_percent: 0
  });
}

export function ChatMasterReadinessPanel({ data }: { data: any }) {
  const tier = data?.readiness_tier || data?.tier || "unknown";
  const routingMaturity = data?.routing_maturity || "unknown";
  const routeCoverage = data?.route_coverage_percent ?? data?.route_coverage ?? 0;
  const diagnosticsCoverage = data?.diagnostics_coverage_percent ?? data?.diagnostics_coverage ?? 0;

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div>
        <h2 className="text-lg font-semibold">Chat Master Readiness</h2>
        <p className="mt-1 text-sm text-slate-400">Deployment maturity classification, Readiness Tier, Route Coverage, and Diagnostics Coverage.</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Readiness API" value={data?.ok ? "Available" : "Issue"} />
        <StatCard title="Readiness Tier" value={tier} />
        <StatCard title="Routing Maturity" value={routingMaturity} />
        <StatCard title="Route Coverage" value={`${routeCoverage}%`} />
        <StatCard title="Diagnostics Coverage" value={`${diagnosticsCoverage}%`} />
      </div>
    </div>
  );
}

export function ChatMasterDiagnosticsPanel({ data }: { data: any }) {
  const diagnostics = data?.diagnostics || [];
  const sampleQueries = data?.sample_queries || [];
  const confidence = data?.confidence_distribution || {};
  const averageConfidence = data?.average_confidence || "0.00";
  const routingMaturity = data?.routing_maturity || "unknown";

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold">Chat Master Diagnostics</h2>
      <p className="mt-1 text-sm text-slate-400">Runtime routing visibility and keyword coverage.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Diagnostics" value={data?.ok ? "Available" : "Issue"} />
        <StatCard title="Intent Count" value={data?.intent_count ?? 0} />
        <StatCard title="Diagnostic Rows" value={diagnostics.length} />
        <StatCard title="Sample Queries" value={sampleQueries.length} />
        <StatCard title="High Confidence" value={confidence.high_confidence ?? 0} />
        <StatCard title="Medium Confidence" value={confidence.medium_confidence ?? 0} />
        <StatCard title="Low Confidence" value={confidence.low_confidence ?? 0} />
        <StatCard title="Average Confidence" value={averageConfidence} />
        <StatCard title="Routing Maturity" value={routingMaturity} />
      </div>

      <div className="mt-4 space-y-3">
        {diagnostics.map((row: any) => (
          <div key={row.intent} className="rounded-xl border border-slate-700 bg-slate-950 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono text-sm text-cyan-300">{row.intent}</div>
                <div className="mt-1 text-xs text-slate-400">
                  Execution Target: {row.execution_target || "unknown"}
                </div>
              </div>
              <div className="rounded-full border border-cyan-800 bg-cyan-950 px-3 py-1 text-xs text-cyan-200">
                {row.keyword_count ?? 0} keywords
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatMasterKeywordsPanel({ data }: { data: any }) {
  const keywords = data?.keywords || {};
  const intents = data?.intents || Object.keys(keywords);

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold">Chat Master Keywords</h2>
      <p className="mt-1 text-sm text-slate-400">Centralized routing keyword contracts.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Keyword Status" value={data?.ok ? "Available" : "Issue"} />
        <StatCard title="Intent Count" value={intents.length} />
        <StatCard title="Keyword Groups" value={Object.keys(keywords).length} />
      </div>
    </div>
  );
}

export function ChatMasterExecutionMapPanel({ data }: { data: any }) {
  const map = data?.execution_map || {};
  const intents = data?.intents || Object.keys(map);

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold">Chat Master Execution Map</h2>
      <p className="mt-1 text-sm text-slate-400">Current intent-to-node routing targets.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Map Status" value={data?.ok ? "Available" : "Issue"} />
        <StatCard title="Intent Count" value={intents.length} />
        <StatCard title="Routing Targets" value={Object.keys(map).length} />
      </div>
    </div>
  );
}

export function ChatMasterIntentsPanel({ data }: { data: any }) {
  const intents = data?.chat_master_intents?.intents || [];
  const status = data?.chat_master_intents?.status || "unknown";

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold">Chat Master Intents</h2>
      <p className="mt-1 text-sm text-slate-400">Available routing intents for unified HX2 orchestration.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Status" value={status} />
        <StatCard title="Intent Count" value={intents.length} />
        <StatCard title="Routing Contract" value={intents.length > 0 ? "Available" : "Missing"} />
      </div>
    </div>
  );
}

export function ChatMasterStatusPanel({ status }: { status: any }) {
  const chat = status?.chat_master || {};
  const readiness = Number(chat?.readiness_percent ?? 0);
  const ok = status?.ok === true && readiness === 100;

  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold">Chat Master Status</h2>
      <p className="mt-1 text-sm text-slate-400">Unified HX2 routing foundation readiness.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Status" value={ok ? "Ready" : "Partial"} />
        <StatCard title="Readiness" value={`${readiness}%`} />
        <StatCard title="Healthy Checks" value={chat?.healthy_checks ?? 0} />
        <StatCard title="Total Checks" value={chat?.total_checks ?? 0} />
      </div>
    </div>
  );
}

export async function ChatMasterPanels() {
  const [
    status,
    intents,
    executionMap,
    keywords,
    diagnostics,
    readiness
  ] = await Promise.all([
    getChatMasterStatus(),
    getChatMasterIntents(),
    getChatMasterExecutionMap(),
    getChatMasterKeywords(),
    getChatMasterDiagnostics(),
    getChatMasterReadiness()
  ]);

  return (
    <>
      <CapabilityPlannerPreviewPanel />
      <ChatMasterStatusPanel status={status} />
      <ChatMasterReadinessPanel data={readiness} />
      <ChatMasterIntentsPanel data={intents} />
      <ChatMasterExecutionMapPanel data={executionMap} />
      <ChatMasterKeywordsPanel data={keywords} />
      <ChatMasterDiagnosticsPanel data={diagnostics} />
    </>
  );
}



