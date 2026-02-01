"use client";

import React, { useMemo, useState } from "react";

type H2Signal = { key: string; level: "green" | "yellow" | "red" | "unknown"; note?: string };
type H2Output = {
  regime: string;
  summary: string;
  signals?: H2Signal[];
  next_actions?: string[];
  adapters?: Record<string, boolean>;
  echo?: { text: string; length: number };
};
type H2Response = {
  ok: boolean;
  service: string;
  endpoint: string;
  result?: { node: string; mode: string; input?: any; output?: H2Output };
  ts?: string;
  error?: { message?: string; code?: string };
};

function Badge({ level }: { level: H2Signal["level"] }) {
  const cls =
    level === "green" ? "bg-green-100 text-green-800" :
    level === "yellow" ? "bg-yellow-100 text-yellow-800" :
    level === "red" ? "bg-red-100 text-red-800" :
    "bg-gray-100 text-gray-700";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{level}</span>;
}

export default function H2Client() {
  const [query, setQuery] = useState("status");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<H2Response | null>(null);

  const output = data?.result?.output;

  const pretty = useMemo(() => {
    if (!data) return "";
    try { return JSON.stringify(data, null, 2); } catch { return String(data); }
  }, [data]);

  async function run(q: string) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/h2/run?ts=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "SAFE", query: q }),
      });
      const j = (await res.json()) as H2Response;
      if (!res.ok || j.ok !== true) throw new Error(j?.error?.message || `HTTP ${res.status}`);
      setData(j);
    } catch (e: any) {
      setErr(e?.message || "Request failed");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">H2</h1>
          <p className="text-sm text-gray-600">SAFE mode UI → POST /api/h2/run</p>
        </div>
        <div className="text-xs text-gray-500">
          {data?.ts ? <div>ts: {data.ts}</div> : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="px-3 py-2 rounded bg-black text-white text-sm" disabled={loading} onClick={() => run("status")}>Status</button>
        <button className="px-3 py-2 rounded bg-gray-900 text-white text-sm" disabled={loading} onClick={() => run("caps")}>Caps</button>
        <button className="px-3 py-2 rounded bg-gray-700 text-white text-sm" disabled={loading} onClick={() => run("echo:hello ui")}>Echo</button>
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 border rounded text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try: status | caps | echo:hello | ...'
        />
        <button className="px-4 py-2 rounded bg-blue-600 text-white text-sm" disabled={loading} onClick={() => run(query)}>
          {loading ? "Running..." : "Run"}
        </button>
      </div>

      {err ? (
        <div className="p-3 rounded border border-red-200 bg-red-50 text-red-800 text-sm">
          <div className="font-medium">Error</div>
          <div className="mt-1">{err}</div>
        </div>
      ) : null}

      {output ? (
        <div className="p-4 rounded border bg-white space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm"><span className="font-medium">Regime:</span> {output.regime}</div>
            <div className="text-sm text-gray-600">{output.summary}</div>
          </div>

          {output.signals?.length ? (
            <div className="space-y-2">
              <div className="text-sm font-medium">Signals</div>
              <div className="space-y-2">
                {output.signals.map((s, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 p-3 rounded border">
                    <div className="text-sm">
                      <div className="font-medium">{s.key}</div>
                      {s.note ? <div className="text-gray-600">{s.note}</div> : null}
                    </div>
                    <Badge level={s.level} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {output.next_actions?.length ? (
            <div className="space-y-2">
              <div className="text-sm font-medium">Next actions</div>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {output.next_actions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          ) : null}

          {output.adapters ? (
            <div className="space-y-2">
              <div className="text-sm font-medium">Adapters</div>
              <pre className="text-xs bg-gray-50 border rounded p-3 overflow-auto">{JSON.stringify(output.adapters, null, 2)}</pre>
            </div>
          ) : null}

          {output.echo ? (
            <div className="space-y-2">
              <div className="text-sm font-medium">Echo</div>
              <pre className="text-xs bg-gray-50 border rounded p-3 overflow-auto">{JSON.stringify(output.echo, null, 2)}</pre>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="text-sm font-medium">Raw response</div>
        <pre className="text-xs bg-gray-50 border rounded p-3 overflow-auto">{pretty || "—"}</pre>
      </div>
    </div>
  );
}
