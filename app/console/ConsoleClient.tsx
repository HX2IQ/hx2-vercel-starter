"use client";

import { useState } from "react";

export default function ConsoleClient() {
  const [payload, setPayload] = useState<string>('{"task":"ping","mode":"SAFE"}');
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<string>("");

  async function run() {
    setLoading(true);
    setOut("");

    try {
      const res = await fetch("/api/ap2/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      const text = await res.text();

      // Try to pretty-print JSON; fall back to raw text
      try {
        const json = JSON.parse(text);
        setOut(JSON.stringify(json, null, 2));
      } catch {
        setOut(text);
      }
    } catch (e: any) {
      setOut(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 980 }}>
      <h1 style={{ marginBottom: 8 }}>HX2 Console</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        This page POSTs JSON to <code>/api/ap2/execute</code> and prints the response.
      </p>

      <label style={{ display: "block", fontWeight: 600, marginTop: 16, marginBottom: 8 }}>
        Request payload (JSON)
      </label>
      <textarea
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
        rows={10}
        style={{
          width: "100%",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 13,
          padding: 12,
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.2)",
        }}
      />

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button
          onClick={run}
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.25)",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Running..." : "Run /api/ap2/execute"}
        </button>

        <button
          onClick={() => setPayload('{"task":"ping","mode":"SAFE"}')}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.25)",
            cursor: "pointer",
          }}
        >
          Load ping
        </button>
      </div>

      <label style={{ display: "block", fontWeight: 600, marginTop: 18, marginBottom: 8 }}>
        Response
      </label>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          padding: 12,
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.2)",
          background: "rgba(0,0,0,0.03)",
          minHeight: 160,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 13,
        }}
      >
        {out || "(no response yet)"}
      </pre>
    </main>
  );
}
