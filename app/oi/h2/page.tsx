export const dynamic = "force-dynamic";
export const revalidate = 0;
"use client";

import React, { useMemo, useState } from "react";

type H2Signal = { key: string; level: "green" | "yellow" | "red" | "unknown"; note?: string };
type H2Output = {
  regime?: string;
  summary?: string;
  signals?: H2Signal[];
  next_actions?: string[];
  echo?: { text?: string; length?: number };
  adapters?: Record<string, boolean>;
};
type H2Response = {
  ok: boolean;
  service?: string;
  endpoint?: string;
  result?: {
    node?: string;
    mode?: string;
    input?: { query?: string };
    output?: H2Output;
  };
  ts?: string;
  error?: string;
};

function levelClass(level: H2Signal["level"]) {
  switch (level) {
    case "green": return "bg-green-100 text-green-900 border-green-200";
    case "yellow": return "bg-yellow-100 text-yellow-900 border-yellow-200";
    case "red": return "bg-red-100 text-red-900 border-red-200";
    default: return "bg-slate-100 text-slate-900 border-slate-200";
  }
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900 mb-2">{title}</div>
      <div className="text-sm text-slate-800">{children}</div>
    </div>
  );
}

export default function H2Page() {
  const [query, setQuery] = useState<string>("status");
  const [mode, setMode] = useState<"SAFE">("SAFE");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<H2Response | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const output = resp?.result?.output;

  const pills = useMemo(() => {
    const sigs = output?.signals ?? [];
    return sigs;
  }, [output]);

  async function run() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/h2/run?ts=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, query }),
      });
      const j = (await r.json()) as H2Response;
      setResp(j);
      if (!j.ok) setErr(j.error ?? "Request failed");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-4">
          <div className="text-2xl font-bold text-slate-900">H2 — Situational Intelligence</div>
          <div className="text-sm text-slate-600">SAFE UI (no external intel sources)</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm mb-6">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-slate-900">Query</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try: "status", "caps", "echo:hello ui"'
            />

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Mode:</span>
              <span className="text-xs font-semibold text-slate-800">{mode}</span>

              <button
                onClick={run}
                disabled={loading}
                className="ml-auto rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Running..." : "Run"}
              </button>
            </div>

            {err ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-900">
                {err}
              </div>
            ) : null}
          </div>
        </div>

        {resp ? (
          <div className="grid gap-4">
            <Card title="Status">
              <div className="grid gap-1">
                <div><b>node:</b> {resp.result?.node ?? "—"}</div>
                <div><b>mode:</b> {resp.result?.mode ?? "—"}</div>
                <div><b>regime:</b> {output?.regime ?? "—"}</div>
                <div className="text-xs text-slate-500"><b>ts:</b> {resp.ts ?? "—"}</div>
              </div>
            </Card>

            <Card title="Summary">
              <div>{output?.summary ?? "—"}</div>
            </Card>

            <Card title="Signals">
              <div className="flex flex-wrap gap-2">
                {(pills.length ? pills : [{ key: "none", level: "unknown" as const, note: "No signals returned" }]).map((s, i) => (
                  <span key={i} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${levelClass(s.level)}`}>
                    <b>{s.key}</b>
                    {s.note ? <span className="opacity-80">{s.note}</span> : null}
                  </span>
                ))}
              </div>
            </Card>

            {output?.next_actions?.length ? (
              <Card title="Next actions">
                <ol className="list-decimal pl-5">
                  {output.next_actions.map((a, i) => <li key={i} className="mb-1">{a}</li>)}
                </ol>
              </Card>
            ) : null}

            {output?.adapters ? (
              <Card title="Adapters">
                <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs border border-slate-200">
{JSON.stringify(output.adapters, null, 2)}
                </pre>
              </Card>
            ) : null}

            {output?.echo ? (
              <Card title="Echo">
                <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs border border-slate-200">
{JSON.stringify(output.echo, null, 2)}
                </pre>
              </Card>
            ) : null}
          </div>
        ) : (
          <div className="text-sm text-slate-600">Run a query to see results…</div>
        )}
      </div>
    </div>
  );
}


