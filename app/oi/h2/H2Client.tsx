"use client";

import React, { useMemo, useState } from "react";

type H2Signal = { key: string; level: "green" | "yellow" | "red" | "unknown"; note?: string };
type H2Output = { regime: string; summary: string; signals?: H2Signal[]; next_actions?: string[]; echo?: any; adapters?: any };
type H2Result = { node: string; mode: string; input: { query: string }; output: H2Output };
type H2Response = { ok: boolean; service: string; endpoint: string; result: H2Result; ts: string };

function Badge({ level }: { level: H2Signal["level"] }) {
  const label = level.toUpperCase();
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 12,
      border: "1px solid rgba(0,0,0,0.15)"
    }}>
      {label}
    </span>
  );
}

export default function H2Client() {
  const [query, setQuery] = useState<string>("status");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<H2Response | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const output = data?.result?.output;

  const canSubmit = useMemo(() => query.trim().length > 0 && !loading, [query, loading]);

  async function run(q: string) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/h2/run?ts=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "SAFE", query: q })
      });

      const json = (await res.json()) as H2Response;
      if (!json?.ok) throw new Error("H2 returned ok:false");
      setData(json);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>H2 — Situational Intelligence</h1>
      <p style={{ marginTop: 0, opacity: 0.75 }}>
        SAFE mode shell. No external intel adapters.
      </p>

      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try: status | echo:hello ui | caps'
          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
        />
        <button
          disabled={!canSubmit}
          onClick={() => run(query)}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)", cursor: canSubmit ? "pointer" : "not-allowed" }}
        >
          {loading ? "Running..." : "Run"}
        </button>
      </div>

      {err && (
        <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(0,0,0,0.2)", marginBottom: 16 }}>
          <b>Error:</b> {err}
        </div>
      )}

      {!data && !err && (
        <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)" }}>
          Click <b>Run</b> to call <code>/api/h2/run</code>.
        </div>
      )}

      {data && (
        <div style={{ display: "grid", gap: 12 }}>
          <section style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div><b>Regime:</b> {output?.regime ?? "?"}</div>
              <div><b>Node:</b> {data.result.node}</div>
              <div><b>Mode:</b> {data.result.mode}</div>
            </div>
            <p style={{ marginBottom: 0 }}>{output?.summary}</p>
          </section>

          {!!output?.signals?.length && (
            <section style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(0,0,0,0.12)" }}>
              <h2 style={{ fontSize: 16, marginTop: 0 }}>Signals</h2>
              <div style={{ display: "grid", gap: 8 }}>
                {output.signals.map((s) => (
                  <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Badge level={s.level} />
                    <div><b>{s.key}</b>{s.note ? ` — ${s.note}` : ""}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!!output?.next_actions?.length && (
            <section style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(0,0,0,0.12)" }}>
              <h2 style={{ fontSize: 16, marginTop: 0 }}>Next actions</h2>
              <ol style={{ marginBottom: 0 }}>
                {output.next_actions.map((a, i) => <li key={i}>{a}</li>)}
              </ol>
            </section>
          )}

          <section style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(0,0,0,0.12)" }}>
            <h2 style={{ fontSize: 16, marginTop: 0 }}>Raw</h2>
            <pre style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>{JSON.stringify(data, null, 2)}</pre>
          </section>
        </div>
      )}
    </main>
  );
}
