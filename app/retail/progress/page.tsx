"use client";

import { useEffect, useState } from "react";

type Card = { name: string; status: "ok" | "warn" | "fail"; detail?: any };

function color(s: Card["status"]) {
  if (s === "ok") return "rgba(16,185,129,0.18)";
  if (s === "warn") return "rgba(245,158,11,0.18)";
  return "rgba(239,68,68,0.18)";
}

function border(s: Card["status"]) {
  if (s === "ok") return "rgba(16,185,129,0.45)";
  if (s === "warn") return "rgba(245,158,11,0.45)";
  return "rgba(239,68,68,0.45)";
}

export default function RetailProgressPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [busy, setBusy] = useState(false);
  const [ts, setTs] = useState<string>("");

  async function run() {
    setBusy(true);
    setTs(new Date().toISOString());

    const results: Card[] = [];

    // 1) Basic site health
    results.push({ name: "Retail Site", status: "ok", detail: { url: window.location.origin } });

    // 2) Registry status (existing endpoint)
    try {
      const r = await fetch("/api/hx2_registry", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      results.push({ name: "Registry API", status: r.ok && j?.ok ? "ok" : "fail", detail: { http: r.status, body: j } });
    } catch (e: any) {
      results.push({ name: "Registry API", status: "fail", detail: { error: e?.message || String(e) } });
    }

    // 3) Demo node route (public)
    try {
      const r = await fetch("/api/nodes/demo-node-01/ping", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      results.push({ name: "demo-node-01 Ping", status: r.ok && j?.ok ? "ok" : "fail", detail: { http: r.status, body: j } });
    } catch (e: any) {
      results.push({ name: "demo-node-01 Ping", status: "fail", detail: { error: e?.message || String(e) } });
    }

    // 4) Demo node describe (public)
    try {
      const r = await fetch("/api/nodes/demo-node-01/describe", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      results.push({ name: "demo-node-01 Describe", status: r.ok && j?.ok ? "ok" : "fail", detail: { http: r.status, body: j } });
    } catch (e: any) {
      results.push({ name: "demo-node-01 Describe", status: "fail", detail: { error: e?.message || String(e) } });
    }

    setCards(results);
    setBusy(false);
  }

  useEffect(() => { run(); }, []);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Retail Progress Dashboard</h1>
          <div style={{ opacity: 0.75, fontSize: 13 }}>Live SAFE checks for OptinodeIQ build progress.</div>
        </div>
        <button
          onClick={run}
          disabled={busy}
          style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.2)" }}
        >
          {busy ? "Running..." : "Run checks"}
        </button>
      </div>

      <div style={{ marginTop: 12, opacity: 0.65, fontSize: 12 }}>Last run: {ts}</div>

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        {cards.map((c) => (
          <div key={c.name} style={{ padding: 14, borderRadius: 14, background: color(c.status), border: `1px solid ${border(c.status)}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div style={{ fontWeight: 800 }}>{c.name}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>{c.status.toUpperCase()}</div>
            </div>
            <pre style={{ marginTop: 10, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, opacity: 0.9 }}>
{JSON.stringify(c.detail ?? {}, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, opacity: 0.65, fontSize: 12 }}>
        Next: add AP2 enqueue+status checks (authenticated) and a “Node Inventory” panel.
      </div>
    </main>
  );
}
