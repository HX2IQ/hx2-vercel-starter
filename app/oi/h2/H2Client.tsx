"use client";

import React, { useEffect, useMemo, useState } from "react";

type SignalLevel = "green" | "yellow" | "red" | "unknown";
type H2Signal = { key: string; level: SignalLevel; note?: string };

type H2RunResponse = {
  ok: boolean;
  service?: string;
  endpoint?: string;
  result?: {
    node?: string;
    mode?: string;
    input?: { query?: string };
    output?: {
      regime?: string;
      summary?: string;
      signals?: H2Signal[];
      next_actions?: string[];
      echo?: any;
      adapters?: Record<string, boolean>;
    };
  };
  error?: string;
  ts?: string;
};

function levelDot(level: SignalLevel) {
  switch (level) {
    case "green": return "🟢";
    case "yellow": return "🟡";
    case "red": return "🔴";
    default: return "⚪";
  }
}

async function runH2(query: string): Promise<H2RunResponse> {
  const r = await fetch(`/api/h2/run?ts=${Date.now()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "SAFE", query })
  });
  return await r.json();
}

export default function H2Client() {
  const [query, setQuery] = useState("status");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<H2RunResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const output = res?.result?.output;

  const signals = useMemo(() => output?.signals ?? [], [output]);
  const nextActions = useMemo(() => output?.next_actions ?? [], [output]);

  useEffect(() => {
    // Auto-run once on load for a "real" H2 page.
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await runH2("status");
        setRes(data);
        if (!data.ok) setErr(data.error ?? "unknown_error");
      } catch (e: any) {
        setErr(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onRun() {
    setLoading(true);
    setErr(null);
    try {
      const data = await runH2(query);
      setRes(data);
      if (!data.ok) setErr(data.error ?? "unknown_error");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 22, marginBottom: 6 }}>H2 — Situational Intelligence</h1>
      <div style={{ opacity: 0.75, marginBottom: 14 }}>
        UI: <code>/oi/h2</code> → API: <code>POST /api/h2/run</code> (SAFE)
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='try: status | caps | echo:hello'
          style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
        />
        <button
          onClick={onRun}
          disabled={loading}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
        >
          {loading ? "Running..." : "Run"}
        </button>
      </div>

      {err && (
        <div style={{ padding: 12, borderRadius: 12, border: "1px solid #f1c7c7", background: "#fff5f5", marginBottom: 14 }}>
          <strong>Error:</strong> {err}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <div style={{ padding: 14, borderRadius: 14, border: "1px solid #eee", background: "#fff" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Regime</div>
          <div>{output?.regime ?? "—"}</div>
        </div>

        <div style={{ padding: 14, borderRadius: 14, border: "1px solid #eee", background: "#fff" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Summary</div>
          <div style={{ lineHeight: 1.4 }}>{output?.summary ?? "—"}</div>
        </div>

        <div style={{ padding: 14, borderRadius: 14, border: "1px solid #eee", background: "#fff" }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Signals</div>
          {signals.length === 0 ? (
            <div style={{ opacity: 0.7 }}>—</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {signals.map((s, i) => (
                <li key={`${s.key}-${i}`} style={{ marginBottom: 6 }}>
                  {levelDot(s.level)} <strong>{s.key}</strong>{s.note ? ` — ${s.note}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ padding: 14, borderRadius: 14, border: "1px solid #eee", background: "#fff" }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Next actions</div>
          {nextActions.length === 0 ? (
            <div style={{ opacity: 0.7 }}>—</div>
          ) : (
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {nextActions.map((a, i) => (
                <li key={`na-${i}`} style={{ marginBottom: 6 }}>{a}</li>
              ))}
            </ol>
          )}
        </div>

        <div style={{ padding: 14, borderRadius: 14, border: "1px solid #eee", background: "#fff" }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Raw JSON</div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, lineHeight: 1.35 }}>
{JSON.stringify(res, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
