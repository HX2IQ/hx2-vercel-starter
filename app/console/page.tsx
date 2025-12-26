"use client";

import React, { useMemo, useState } from "react";

type Msg = { role: "user" | "hx2"; text: string };

export default function ConsolePage() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "hx2", text: "HX2 Console ready. Type JSON (recommended) or 'help'." }
  ]);

  const canSend = useMemo(() => input.trim().length > 0 && !busy, [input, busy]);

  async function send() {
    if (!canSend) return;
    const text = input.trim();
    setInput("");
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", text }]);

    try {
      const res = await fetch("/api/console/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json().catch(() => ({}));
      const reply =
        typeof data?.reply === "string"
          ? data.reply
          : JSON.stringify(data, null, 2);

      setMsgs((m) => [...m, { role: "hx2", text: reply }]);
    } catch (e: any) {
      setMsgs((m) => [...m, { role: "hx2", text: `ERROR: ${e?.message || String(e)}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>HX2 Console</h1>
      <div style={{ opacity: 0.8, marginBottom: 12 }}>
        Try:
        <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8, overflowX: "auto" }}>
{`{"task":"ping","mode":"SAFE"}
{"task":"scaffold.execute","mode":"SAFE","blueprint_name":"console.ui.v1"}`}
        </pre>
      </div>

      <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12, minHeight: 360, background: "#0b0b0b", color: "#f2f2f2" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ marginBottom: 10, whiteSpace: "pre-wrap" }}>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}>{m.role.toUpperCase()}</div>
            <div style={{ background: m.role === "user" ? "#14213d" : "#1b1b1b", padding: 10, borderRadius: 10 }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey || !e.shiftKey)) {
              e.preventDefault();
              send();
            }
          }}
          placeholder='Type JSON (recommended) like {"task":"ping","mode":"SAFE"}'
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #333",
            background: "#0f0f0f",
            color: "#f2f2f2"
          }}
        />
        <button
          onClick={send}
          disabled={!canSend}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #333",
            background: canSend ? "#1f6feb" : "#222",
            color: "#fff",
            cursor: canSend ? "pointer" : "not-allowed"
          }}
        >
          {busy ? "Sending..." : "Send"}
        </button>
      </div>
    </main>
  );
}
