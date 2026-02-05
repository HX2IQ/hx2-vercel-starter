"use client";

import React, { useMemo, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, json };
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationId = useMemo(() => `convo_${Date.now()}`, []);
  const canSend = !busy && input.trim().length > 0;

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setError(null);
    setBusy(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    // enqueue
    const sendRes = await postJson("/api/chat/send", {
      conversationId,
      messages: [{ role: "user", content: text }],
      ts: Date.now(),
    });

    const taskId = sendRes.json?.taskId;
    if (!sendRes.ok || !taskId) {
      setBusy(false);
      setError(`Send failed: HTTP ${sendRes.status} ${sendRes.json?.error || ""}`.trim());
      return;
    }

    // poll
    const pollBody = { mode: "SAFE", taskId };
    for (let i = 0; i < 80; i++) {
      const st = await postJson("/api/chat/status", pollBody);
      const state = String(st.json?.state || "").toUpperCase();

      if (st.json?.found && (state === "DONE" || state === "COMPLETED")) {
        const reply = st.json?.result?.data?.reply ?? st.json?.result?.reply ?? "(no reply)";
        setMessages((prev) => [...prev, { role: "assistant", content: String(reply) }]);
        setBusy(false);
        return;
      }

      if (st.json?.found && (state === "ERROR" || state === "FAILED")) {
        setBusy(false);
        setError(`Task failed: ${st.json?.error || st.json?.result?.error || "unknown_error"}`);
        return;
      }

      await sleep(350);
    }

    setBusy(false);
    setError(`Timeout waiting for reply (taskId=${taskId})`);
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, opacity: 0.85 }}>
        <div style={{ fontSize: 12 }}>Opti Chat</div>
        <a href="/opti" style={{ fontSize: 12, textDecoration: "underline" }}>What is Opti?</a>
      </div>

      <h1 style={{ fontSize: 22, marginBottom: 12 }}>OI Chat</h1>

      {error ? (
        <div style={{ marginBottom: 10, padding: 10, border: "1px solid #f99", borderRadius: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Error</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{error}</div>
        </div>
      ) : null}

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, minHeight: 320 }}>
        {messages.length === 0 ? (
          <div style={{ color: "#666" }}>Type a message below.</div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>{m.role}</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
            </div>
          ))
        )}
        {busy ? <div style={{ marginTop: 10, color: "#666" }}>thinking…</div> : null}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => { if (e.key === "Enter" && canSend) send(); }}
          placeholder="Message…"
          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <button
          onClick={send}
          disabled={!canSend}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: canSend ? "pointer" : "not-allowed",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
