"use client";

import { useMemo, useState } from "react";

type Msg = { role: "You" | "HX2"; text: string };

export default function ConsoleChatPage() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "HX2", text: "HX2 console online. Try: ping, status, help, ap2 ping" },
  ]);

  const canSend = useMemo(() => input.trim().length > 0 && !busy, [input, busy]);

  async function send() {
    const cmd = input.trim();
    if (!cmd || busy) return;

    setBusy(true);
    setInput("");
    setMessages((m) => [...m, { role: "You", text: cmd }]);

    try {
      const res = await fetch("/api/console/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });

      const data = await res.json().catch(() => ({}));
      const reply = data?.reply ?? (res.ok ? "ok" : `Error (${res.status})`);

      setMessages((m) => [...m, { role: "HX2", text: reply }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "HX2", text: `Network error: ${e?.message ?? "unknown"}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: "0 16px", fontFamily: "system-ui, Arial" }}>
      <h1 style={{ fontSize: 44, marginBottom: 18 }}>HX2 Console Chat</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Type command..."
          style={{ flex: 1, padding: "10px 12px", fontSize: 16 }}
        />
        <button onClick={send} disabled={!canSend} style={{ padding: "10px 16px", fontSize: 16 }}>
          {busy ? "..." : "Send"}
        </button>
      </div>

      <ul style={{ lineHeight: 1.8, fontSize: 18 }}>
        {messages.map((m, i) => (
          <li key={i}>
            <b>{m.role}:</b> {m.text}
          </li>
        ))}
      </ul>
    </main>
  );
}
