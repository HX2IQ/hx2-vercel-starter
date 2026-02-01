"use client";

import React, { useMemo, useState } from "react";

type H2Signal = { key: string; level: "green" | "yellow" | "red" | "unknown"; note?: string };
type H2Output = {
  regime?: string;
  summary?: string;
  signals?: H2Signal[];
  next_actions?: string[];
  echo?: { text: string; length: number };
  adapters?: Record<string, boolean>;
};

type H2Result = {
  node: string;
  mode: string;
  input: { query: string };
  output: H2Output;
};

type H2Response = {
  ok: boolean;
  service: string;
  endpoint: string;
  result: H2Result;
  ts: string;
};

function Badge({ level }: { level: H2Signal["level"] }) {
  const cls =
    level === "green" ? "bg-green-100 text-green-800 border-green-200" :
    level === "yellow" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
    level === "red" ? "bg-red-100 text-red-800 border-red-200" :
    "bg-gray-100 text-gray-800 border-gray-200";

  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${cls}`}>{level}</span>;
}

export default function H2Client() {
  const [query, setQuery] = useState("status");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<H2Response | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const pretty = useMemo(() => (res ? JSON.stringify(res, null, 2) : ""), [res]);

  async function run(q: string) {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/h2/run?ts=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "SAFE", query: q }),
        cache: "no-store",
      });
      const j = (await r.json()) as H2Response;
      if (!r.ok || !j.ok) throw new Error((j as any)?.error ?? `HTTP ${r.status}`);
      setRes(j);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
      setRes(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">H2 — Situational Intelligence</h1>
        <p className="text-sm text-gray-500">SAFE contract v1 (no external intel sources).</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try: status | echo:hello ui | caps'
        />
        <button
          className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
          disabled={loading || !query.trim()}
          onClick={() => run(query.trim())}
        >
          {loading ? "Running…" : "Run"}
        </button>
      </div>

      {err && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {err}
        </div>
      )}

      {res && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <div><span className="font-medium">Regime:</span> {res.result.output.regime ?? "unknown"}</div>
                <div className="text-gray-500">{res.result.output.summary ?? ""}</div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(res.ts).toLocaleString()}
              </div>
            </div>

            {!!res.result.output.signals?.length && (
              <div className="mt-3 space-y-2">
                {res.result.output.signals.map((s) => (
                  <div key={s.key} className="flex items-center justify-between gap-3 rounded-lg border p-2">
                    <div className="text-sm">
                      <div className="font-medium">{s.key}</div>
                      {!!s.note && <div className="text-xs text-gray-500">{s.note}</div>}
                    </div>
                    <Badge level={s.level} />
                  </div>
                ))}
              </div>
            )}

            {!!res.result.output.next_actions?.length && (
              <div className="mt-4">
                <div className="text-sm font-medium">Next actions</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                  {res.result.output.next_actions.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-2 text-sm font-medium">Raw JSON</div>
            <pre className="overflow-auto rounded-lg bg-gray-50 p-3 text-xs">{pretty}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

