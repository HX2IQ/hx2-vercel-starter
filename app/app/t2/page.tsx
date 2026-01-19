"use client";

import Link from "next/link";
import React, { useState } from "react";

export default function Page() {
  const [baseUrl, setBaseUrl] = useState("https://optinodeiq.com");
  const [token, setToken] = useState("");
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(
      { imageUrl: "https://example.com/booth.jpg", context: "Miami boat show" },
      null,
      2
    )
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  const taskType = "t2.analyze";

  async function run() {
    setBusy(true);
    setResult(null);

    let payload: any = {};
    try {
      payload = payloadText?.trim() ? JSON.parse(payloadText) : {};
    } catch (e: any) {
      setResult({ ok: false, error: "Invalid JSON", detail: e?.message });
      setBusy(false);
      return;
    }

    const id = `${taskType}-${Math.floor(Date.now() / 1000)}`;
    const body = { taskType, id, payload };

    try {
      const base = baseUrl.replace(/\/$/, "");
      const r = await fetch(`${base}/api/ap2/task/enqueue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const text = await r.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        json = { raw: text };
      }

      setResult(r.ok ? json : { ok: false, http: r.status, response: json });
    } catch (e: any) {
      setResult({ ok: false, error: e?.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>TradeShowIQ</h1>
        <Link href="/app" style={{ fontWeight: 800 }}>← Back</Link>
      </div>

      <p style={{ opacity: 0.8, marginTop: 0 }}>
        SAFE retail page (wired to AP2 enqueue). Paste token to authenticate.
      </p>

      <section style={{ display: "grid", gap: 12, padding: 12, border: "1px solid #e5e7eb", borderRadius: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 800 }}>Base URL</span>
          <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 800 }}>Authorization token (HX2_API_KEY)</span>
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste 64-char token" style={{ padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ padding: 10, border: "1px solid #e5e7eb", borderRadius: 10 }}>
            <div style={{ fontWeight: 900 }}>taskType</div>
            <div style={{ marginTop: 6, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>{taskType}</div>
          </div>

          <button
            onClick={run}
            disabled={busy}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #111827",
              background: busy ? "#9ca3af" : "#111827",
              color: "white",
              fontWeight: 900,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Sending..." : "Run"}
          </button>
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 800 }}>payload (JSON)</span>
          <textarea
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            rows={10}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #d1d5db", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
          />
        </label>
      </section>

      <h2 style={{ marginTop: 18, fontSize: 18, fontWeight: 900 }}>Result</h2>
      <pre style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, lineHeight: 1.35 }}>
{result ? JSON.stringify(result, null, 2) : "(no result yet)"}
      </pre>
    </main>
  );
}
