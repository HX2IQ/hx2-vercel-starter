"use client";

import { useEffect, useMemo, useState } from "react";

type ProofRow = {
  id: number;
  received_at: string;
  task_id: string | null;
  payload: any;
};

export default function Ap2ProofPage() {
  const [apiKey, setApiKey] = useState<string>("");
  const [limit, setLimit] = useState<number>(50);
  const [rows, setRows] = useState<ProofRow[]>([]);
  const [selected, setSelected] = useState<ProofRow | null>(null);
  const [error, setError] = useState<string>("");

  const headers = useMemo(() => {
    const h: Record<string, string> = { "content-type": "application/json" };
    if (apiKey) h["authorization"] = `Bearer ${apiKey}`;
    return h;
  }, [apiKey]);

  async function load() {
    setError("");
    setSelected(null);
    try {
      const res = await fetch(`/api/ap2-proof/events?limit=${limit}`, {
        method: "GET",
        headers,
        cache: "no-store",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t}`);
      }
      const data = await res.json();
      setRows(data.rows || []);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  async function loadDetail(id: number) {
    setError("");
    try {
      const res = await fetch(`/api/ap2-proof/events/${id}`, {
        method: "GET",
        headers,
        cache: "no-store",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t}`);
      }
      const data = await res.json();
      setSelected(data.row || null);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  useEffect(() => {
    // try to remember in-session (not persisted across browser restarts)
    const k = sessionStorage.getItem("HX2_API_KEY_UI") || "";
    if (k) setApiKey(k);
  }, []);

  useEffect(() => {
    if (apiKey) sessionStorage.setItem("HX2_API_KEY_UI", apiKey);
  }, [apiKey]);

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>AP2 Proof Console</h1>
      <div style={{ opacity: 0.8, marginBottom: 16 }}>
        View AP2 callback events stored in Postgres.
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <input
          type="password"
          placeholder="Paste HX2 API Key (Bearer)"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{ width: 420, padding: 8 }}
        />
        <input
          type="number"
          min={1}
          max={200}
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value || "50", 10))}
          style={{ width: 100, padding: 8 }}
        />
        <button onClick={load} style={{ padding: "8px 12px" }}>
          Refresh
        </button>
      </div>

      {error ? (
        <pre style={{ background: "#fee", padding: 12, whiteSpace: "pre-wrap" }}>{error}</pre>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <h3 style={{ marginTop: 0 }}>Latest Events</h3>
          <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
            {rows.map((r) => (
              <div
                key={r.id}
                onClick={() => loadDetail(r.id)}
                style={{
                  cursor: "pointer",
                  padding: 10,
                  borderBottom: "1px solid #eee",
                  background: selected?.id === r.id ? "#f5f7ff" : "white",
                }}
              >
                <div><b>#{r.id}</b> — {r.task_id || "(no task_id)"}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{r.received_at}</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>
                  {JSON.stringify(r.payload)?.slice(0, 160)}
                  {JSON.stringify(r.payload)?.length > 160 ? "…" : ""}
                </div>
              </div>
            ))}
            {!rows.length ? <div style={{ padding: 10, opacity: 0.7 }}>No rows yet.</div> : null}
          </div>
        </div>

        <div>
          <h3 style={{ marginTop: 0 }}>Event Detail</h3>
          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10, minHeight: 240 }}>
            {selected ? (
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {JSON.stringify(selected, null, 2)}
              </pre>
            ) : (
              <div style={{ opacity: 0.7 }}>Click an event to view full payload + headers.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
