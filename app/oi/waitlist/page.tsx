"use client";

import { useMemo, useState } from "react";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);
  const [count, setCount] = useState<number | null>(null);

  const base = useMemo(() => "", []);

  async function refreshCount() {
    setStatus(null);
    const r = await fetch(`${base}/api/retail/waitlist`, { method: "GET" });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j?.ok) setCount(Number(j.count ?? 0));
  }

  async function submit() {
    setStatus(null);
    const r = await fetch(`${base}/api/retail/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const j = await r.json().catch(() => ({}));

    if (r.ok && j?.ok) {
      setStatus({ ok: true, message: "Added. Thank you!" });
      setEmail("");
      await refreshCount();
    } else {
      setStatus({ ok: false, message: j?.error || "Failed" });
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>OI Waitlist</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Public lead capture demo (writes to Upstash via /api/retail/waitlist).
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,.2)" }}
        />
        <button onClick={submit} style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(0,0,0,.2)" }}>
          Join
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={refreshCount} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,.2)" }}>
          Refresh Count
        </button>
        {count !== null ? <span style={{ marginLeft: 10, opacity: 0.85 }}>Current count: {count}</span> : null}
      </div>

      {status ? (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,.12)" }}>
          <b>{status.ok ? "OK" : "Error"}:</b> {status.message}
        </div>
      ) : null}

      <div style={{ marginTop: 24, opacity: 0.7 }}>
        <a href="/oi/retail" style={{ textDecoration: "underline" }}>Back to OI Retail</a>
      </div>
    </main>
  );
}
