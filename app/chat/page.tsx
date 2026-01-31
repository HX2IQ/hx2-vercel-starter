export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";
"use client";

import { useState } from "react";

export default function ChatPage() {
  const [apiKey, setApiKey] = useState("");
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!msg.trim() || busy) return;
    const userMsg = msg.trim();
    setMsg("");
    setLog((l) => [...l, { role: "user", text: userMsg }]);
    setBusy(true);

    try {
      const res = await fetch("/api/brain/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ message: userMsg }),
      });

      const j = await res.json();
      if (!res.ok || !j?.ok) {
        setLog((l) => [...l, { role: "assistant", text: `ERROR: ${j?.error || "request failed"}` }]);
      } else {
        setLog((l) => [...l, { role: "assistant", text: j.reply }]);
      }
    } catch (e: any) {
      setLog((l) => [...l, { role: "assistant", text: `ERROR: ${e?.message || e}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "24px auto", padding: 16, fontFamily: "Arial" }}>
      <h2>HX2 Chat (Brain Shell via AP2) - BUILD STAMP 2026-01-06 22:07:12</h2>

      <div style={{ marginBottom: 10, display: "flex", gap: 8 }}>
        <input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          placeholder="Paste HX2 API key (owner-only, stays in your browser session)"
        />
      </div>

      <div style={{ border: "1px solid #ccc", padding: 12, minHeight: 300, borderRadius: 8 }}>
        {log.map((m, i) => (
          <div key={i} style={{ margin: "8px 0" }}>
            <b>{m.role}:</b> <span>{m.text}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          placeholder="Type message and hit Enter"
        />
        <button onClick={send} disabled={busy} style={{ padding: "10px 14px", borderRadius: 8 }}>
          Send
        </button>
      </div>

      <p style={{ marginTop: 10, color: "#666" }}>
        This is a temporary owner-only UI. Next step is proper login/session so you never paste keys.
      </p>
    </div>
  );
}












