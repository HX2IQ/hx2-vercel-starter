"use client";

import { useState } from "react";

export default function ChatPage() {
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
      const res = await fetch("/api/brain/run", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          // owner auth (same as your curl/PS calls)
          authorization: `Bearer ${process.env.NEXT_PUBLIC_HX2_API_KEY ?? ""}`,
        },
        body: JSON.stringify({
          method: "POST",
          path: "/brain/chat",
          body: { message: userMsg },
        }),
      });

      const j = await res.json();
      const reply =
        j?.proof?.payload?.result?.data?.reply ??
        j?.proof?.payload?.result?.data?.data?.reply ??
        JSON.stringify(j);

      setLog((l) => [...l, { role: "assistant", text: reply }]);
    } catch (e: any) {
      setLog((l) => [...l, { role: "assistant", text: `ERROR: ${e?.message || e}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "24px auto", padding: 16, fontFamily: "Arial" }}>
      <h2>HX2 Chat (Brain Shell via AP2)</h2>
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
        Note: This uses NEXT_PUBLIC_HX2_API_KEY in the browser. For production, we’ll move auth server-side.
      </p>
    </div>
  );
}
