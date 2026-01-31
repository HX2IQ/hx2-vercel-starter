"use client";

import React, { useEffect, useMemo, useState } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type H2Signal = { key: string; level: "green" | "yellow" | "red" | "unknown"; note?: string };
type H2Output = {
  regime?: string;
  summary?: string;
  signals?: H2Signal[];
  next_actions?: string[];
  echo?: { text: string; length: number };
  adapters?: Record<string, boolean>;
};

type H2ApiResponse = {
  ok: boolean;
  service?: string;
  endpoint?: string;
  result?: {
    node?: string;
    mode?: string;
    input?: { query?: string };
    output?: H2Output;
  };
  error?: string;
  ts?: string;
};

function Badge({ level }: { level: H2Signal["level"] }) {
  const txt =
    level === "green" ? "GREEN" :
    level === "yellow" ? "YELLOW" :
    level === "red" ? "RED" : "UNKNOWN";
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 12,
      border: "1px solid rgba(255,255,255,0.2)"
    }}>
      {txt}
    </span>
  );
}

export default function H2Page() {
  const [query, setQuery] = useState("status");
  const [mode, setMode] = useState<"SAFE" | "OWNER">("SAFE");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<H2ApiResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const output = data?.result?.output;

  const pretty = useMemo(() => {
    try { return data ? JSON.stringify(data, null, 2) : ""; } catch { return ""; }
  }, [data]);

  async function run(q: string) {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/h2/run?ts=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, query: q }),
        cache: "no-store",
      });
      const j = (await r.json()) as H2ApiResponse;
      setData(j);
      if (!j.ok) setErr(j.error || "request_failed");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { run("status"); }, []); // initial

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <h1 style={{ fontSize: 28, margin: "0 0 6px 0" }}>H2 — Situational Intelligence</h1>
      <div style={{ opacity: 0.75, marginBottom: 16 }}>
        UI calls <code>/api/h2/run</code> (SAFE contract)
      </div>

      <section style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ opacity: 0.8 }}>Mode</span>
          <select value={mode} onChange={(e) => setMode(e.target.value as any)} style={{ padding: 6 }}>
            <option value="SAFE">SAFE</option>
            <option value="OWNER">OWNER</option>
          </select>
        </label>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="status | echo:hello ui | caps"
          style={{ flex: "1 1 360px", padding: 8 }}
        />

        <button
          onClick={() => run(query)}
          disabled={loading}
          style={{ padding: "8px 14px", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Running..." : "Run"}
        </button>
      </section>

      {err && (
        <div style={{ padding: 12, border: "1px solid rgba(255,0,0,0.35)", marginBottom: 16 }}>
          <b>Error:</b> {err}
        </div>
      )}

      <section style={{ padding: 16, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div><b>Regime:</b> {output?.regime ?? "—"}</div>
          <div><b>Summary:</b> {output?.summary ?? "—"}</div>
        </div>

        {output?.signals?.length ? (
          <div style={{ marginTop: 12 }}>
            <b>Signals</b>
            <ul>
              {output.signals.map((s, i) => (
                <li key={i}>
                  <code>{s.key}</code> <Badge level={s.level} /> {s.note ? `— ${s.note}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {output?.next_actions?.length ? (
          <div style={{ marginTop: 12 }}>
            <b>Next Actions</b>
            <ol>
              {output.next_actions.map((a, i) => <li key={i}>{a}</li>)}
            </ol>
          </div>
        ) : null}
      </section>

      <details>
        <summary style={{ cursor: "pointer" }}><b>Raw JSON</b></summary>
        <pre style={{ whiteSpace: "pre-wrap", padding: 12, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10 }}>
{pretty || "(no response yet)"}
        </pre>
      </details>
    </main>
  );
}
