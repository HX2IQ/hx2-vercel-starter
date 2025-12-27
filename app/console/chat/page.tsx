"use client";

import React, { useMemo, useState } from "react";

type Line = { role: "USER" | "HX2"; text: string };

export default function ConsoleChatPage() {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { role: "HX2", text: "HX2 Console ready. Type JSON (recommended) or 'help'." }
  ]);
  const examples = useMemo(
    () =>
      [
        '{"mode":"SAFE","task":{"type":"ping"}}',
        '{"mode":"SAFE","task":{"type":"help"}}',
        '{"mode":"SAFE","task":{"type":"registry.list"}}'
      ].join("\n"),
    []
  );

  async function send() {
    const raw = input.trim();
    if (!raw) return;

    setLines((p) => [...p, { role: "USER", text: raw }]);
    setInput("");

    // If user types plain "help" or "ping", wrap it.
    let payload: any;
    if (raw.startsWith("{")) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = { mode: "SAFE", task: { type: "help" }, note: "Input JSON parse failed; defaulted to help." };
      }
    } else {
      payload = { mode: "SAFE", task: { type: raw } };
    }

    try {
      const res = await fetch("/api/ap2/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      setLines((p) => [...p, { role: "HX2", text: JSON.stringify(json) }]);
    } catch (e: any) {
      setLines((p) => [...p, { role: "HX2", text: JSON.stringify({ ok: false, error: "network", message: e?.message }) }]);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16, fontFamily: "system-ui, Arial" }}>
      <h1 style={{ margin: 0 }}>HX2 Console Chat</h1>
      <div style={{ marginTop: 12, padding: 12, border: "1px solid #333", borderRadius: 10, background: "#111", color: "#eee" }}>
        <div style={{ opacity: 0.85, marginBottom: 8, whiteSpace: "pre-wrap" }}>
          Try:
          {"\n"}
          {examples}
        </div>

        <div style={{ borderTop: "1px solid #333", paddingTop: 10 }}>
          {lines.map((l, idx) => (
            <div key={idx} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{l.role}</div>
              <div style={{ whiteSpace: "pre-wrap", background: l.role === "USER" ? "#163a66" : "#1b1b1b", padding: 10, borderRadius: 10 }}>
                {l.text}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type JSON like {"mode":"SAFE","task":{"type":"ping"}}'
            style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #444", background: "#0b0b0b", color: "#eee" }}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          />
          <button onClick={send} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #444", background: "#222", color: "#eee" }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
