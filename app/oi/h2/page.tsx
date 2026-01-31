"use client";

import React, { useEffect, useMemo, useState } from "react";

type H2Signal = { key: string; level: string; note?: string };
type H2Output = {
  regime?: string;
  summary?: string;
  signals?: H2Signal[];
  next_actions?: string[];
  echo?: { text: string; length: number };
  adapters?: Record<string, boolean>;
};
type H2Response = {
  ok: boolean;
  result?: {
    output?: H2Output;
    input?: { query?: string };
    mode?: string;
    node?: string;
  };
  ts?: string;
  error?: string;
};

async function runH2(query: string): Promise<H2Response> {
  const ts = Date.now();
  const res = await fetch(`/api/h2/run?ts=${ts}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "SAFE", query }),
    cache: "no-store",
  });
  return res.json();
}

function levelDot(level?: string) {
  const l = (level || "").toLowerCase();
  if (l === "green") return "🟢";
  if (l === "yellow") return "🟡";
  if (l === "red") return "🔴";
  return "⚪";
}

export default function H2Page() {
  const [query, setQuery] = useState("status");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<H2Response | null>(null);
  const output = useMemo(() => data?.result?.output, [data]);

  async function submit(q: string) {
    setLoading(true);
    try {
      const r = await runH2(q);
      setData(r);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    submit("status");
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>H2 (SAFE)</h1>
      <div style={{ opacity: 0.8, marginBottom: 16 }}>
        Endpoint: <code>/api/h2/run</code>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        style={{ display: "flex", gap: 10, marginBottom: 18 }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="status | echo:hello | caps"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.2)",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.2)",
            background: loading ? "#eee" : "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Running..." : "Run"}
        </button>
      </form>

      {!data && <div>Loading…</div>}

      {data && !data.ok && (
        <div style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}>
          <b>Error:</b> {data.error || "unknown"}
        </div>
      )}

      {data?.ok && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Regime</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{output?.regime ?? "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Mode</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{data.result?.mode ?? "SAFE"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Timestamp</div>
                <div style={{ fontSize: 14 }}>{data.ts ?? "—"}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 16 }}>{output?.summary ?? "—"}</div>
          </div>

          {output?.signals?.length ? (
            <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,0.15)" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Signals</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {output.signals.map((s, idx) => (
                  <li key={idx}>
                    {levelDot(s.level)} <b>{s.key}</b>{s.note ? ` — ${s.note}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {output?.next_actions?.length ? (
            <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,0.15)" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Next actions</div>
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {output.next_actions.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ol>
            </div>
          ) : null}

          {output?.adapters ? (
            <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,0.15)" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Adapters</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {Object.entries(output.adapters).map(([k, v]) => (
                  <li key={k}>
                    <b>{k}</b>: {String(v)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {output?.echo ? (
            <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,0.15)" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Echo</div>
              <div>
                <code>{output.echo.text}</code> (len: {output.echo.length})
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
