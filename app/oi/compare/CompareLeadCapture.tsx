"use client";

import { useMemo, useState } from "react";

export default function CompareLeadCapture() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const isValid = useMemo(() => {
    const e = email.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }, [email]);

  async function submit() {
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setMsg({ ok: false, text: "Please enter a valid email." });
      return;
    }

    setBusy(true);
    setMsg(null);

    try {
      const r = await fetch("/api/retail/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: e }),
      });

      const j = await r.json().catch(() => null);

      if (!r.ok || !j?.ok) {
        setMsg({ ok: false, text: "Couldn’t save your email. Please try again." });
      } else {
        setEmail("");
        setMsg({ ok: true, text: "Saved! We’ll send your best pick + tips shortly." });
      }
    } catch {
      setMsg({ ok: false, text: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12, marginBottom: 18 }}>
      <h2 style={{ fontSize: 18, margin: 0 }}>Want the best pick for your situation?</h2>
      <p style={{ marginTop: 8, marginBottom: 12, opacity: 0.85 }}>
        Drop your email — we’ll send a quick recommendation and simple “how to use it” tips.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          inputMode="email"
          autoComplete="email"
          style={{
            flex: "1 1 260px",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ccc",
            fontSize: 14,
          }}
        />
        <button
          onClick={submit}
          disabled={busy || !isValid}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #111",
            background: busy || !isValid ? "#eee" : "#111",
            color: busy || !isValid ? "#666" : "#fff",
            fontSize: 14,
            cursor: busy || !isValid ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Saving..." : "Get my best pick"}
        </button>
      </div>

      {msg ? (
        <div style={{ marginTop: 10, color: msg.ok ? "green" : "crimson" }}>
          {msg.text}
        </div>
      ) : null}

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        No spam. Unsubscribe anytime.
      </div>
    </section>
  );
}
