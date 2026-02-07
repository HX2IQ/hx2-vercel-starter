"use client";

import React, { useMemo, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function httpJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  return { ok: res.ok, status: res.status, json, text };
}

function extractReply(payload: any): string | null {
  // Expected: { ok, taskId, found, state, result: { data: { reply } } }
  const r = payload?.result?.data?.reply;
  if (typeof r === "string" && r.length) return r;

  // Sometimes nested differently (defensive):
  const r2 = payload?.result?.data?.data?.reply;
  if (typeof r2 === "string" && r2.length) return r2;

  return null;
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastTaskId, setLastTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => !busy && input.trim().length > 0, [busy, input]);

  async function send() {
    setError(null);
    const text = input.trim();
    if (!text) return;

    setBusy(true);
    setInput("");

    // Optimistic render user message
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    const ts = Date.now();
    const body = {
      conversationId: `convo_${ts}`,
      messages: [{ role: "user", content: text }],
      ts,
    };

    const sendRes = await httpJson("/api/chat/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    const taskId = sendRes.json?.taskId;
    if (!sendRes.ok || !taskId) {
      setBusy(false);
      setError(`Send failed: HTTP ${sendRes.status} ${sendRes.json?.error || sendRes.text || ""}`.trim());
      return;
    }

    setLastTaskId(taskId);

    // Poll the proven status endpoint (GET)
    for (let i = 0; i < 80; i++) {
      const st = await httpJson(`/api/ap2/task/status?taskId=${encodeURIComponent(taskId)}`, { method: "GET" });

      if (st.ok && st.json?.found) {
        const state = String(st.json?.state || "").toUpperCase();
        if (state === "DONE" || state === "COMPLETED") {
          const reply = extractReply(st.json) || "(no reply)";
          setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
          setBusy(false);
          return;
        }
        if (state === "ERROR" || state === "FAILED") {
          setBusy(false);
          setError(`Task ${taskId} failed: ${st.json?.error || "unknown_error"}`);
          return;
        }
      }

      await sleep(350);
    }

    setBusy(false);
    setError(`Timeout waiting for reply (taskId=${taskId})`);
  }

  return (
    <>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, opacity: 0.85 }}>
      <div style={{ fontSize: 12 }}>Opti Chat</div>
      <a href="/opti" style={{ fontSize: 12, textDecoration: "underline" }}>What is Opti?</a>
    </div>
    <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>OI Chat</h1>

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
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && canSend) send(); }}
          placeholder="Message…"
          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <button
          onClick={send}
          disabled={!canSend}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", cursor: canSend ? "pointer" : "not-allowed" }}
        >
          Send
        </button>
      </div>

      {error ? <div style={{ marginTop: 10, color: "crimson" }}>{error}</div> : null}
      {lastTaskId ? <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>taskId: {lastTaskId}</div> : null}
    </div>
  );
}


