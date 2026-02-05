"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant" | "system";
type Msg = { id: string; role: Role; content: string; ts: number };

function uid(prefix = "m") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function httpJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  return { ok: res.ok, status: res.status, json, text };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Msg[]>(() => ([
    {
      id: uid("a"),
      role: "assistant",
      content: "Hi — I'm Opti. Ask me anything about Optimized Intelligence.",
      ts: Date.now(),
    }
  ]));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = useMemo(() => !busy && input.trim().length > 0, [busy, input]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setError(null);
    setBusy(true);

    const userMsg: Msg = { id: uid("u"), role: "user", content: text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const conversationId = `convo_${Date.now()}`;

    const sendRes = await httpJson("/api/chat/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        conversationId,
        messages: [{ role: "user", content: text }],
        ts: Date.now(),
      }),
    });

    const taskId = sendRes.json?.taskId || sendRes.json?.task?.id;
    if (!sendRes.ok || !taskId) {
      setBusy(false);
      setError(`Send failed (HTTP ${sendRes.status}). ${sendRes.text || ""}`.slice(0, 400));
      return;
    }

    const pollBody = JSON.stringify({ mode: "SAFE", taskId });
    const timeoutMs = 25000;
    const started = Date.now();
    let lastState = "PENDING";

    while (Date.now() - started < timeoutMs) {
      const st = await httpJson("/api/chat/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: pollBody,
      });

      if (!st.ok) {
        setBusy(false);
        setError(`Status failed (HTTP ${st.status}). ${st.text || ""}`.slice(0, 400));
        return;
      }

      const state = String(st.json?.state || "PENDING").toUpperCase();
      lastState = state;

      if (st.json?.found && (state === "DONE" || state === "COMPLETED")) {
        const reply =
          st.json?.result?.data?.reply ??
          st.json?.result?.reply ??
          st.json?.reply ??
          "";

        setMessages((prev) => [
          ...prev,
          { id: uid("a"), role: "assistant", content: String(reply || "").trim() || "(no reply)", ts: Date.now() },
        ]);

        setBusy(false);
        setTimeout(() => textareaRef.current?.focus(), 50);
        return;
      }

      if (state === "ERROR" || state === "FAILED") {
        setBusy(false);
        setError(`Task failed (state=${state}). ${JSON.stringify(st.json?.error || st.json).slice(0, 500)}`);
        return;
      }

      await sleep(350);
    }

    setBusy(false);
    setError(`Timeout waiting for reply (taskId=${taskId}, lastState=${lastState})`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) send();
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#111827" }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#ffffff", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Opti</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{busy ? "Thinking…" : "Ready"}</div>
          </div>
          <a href="/opti" style={{ fontSize: 12, color: "#2563eb", textDecoration: "underline" }}>What is Opti?</a>
        </div>
      </div>

      {/* Transcript */}
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "16px 16px 110px" }}>
        {error ? (
          <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Error</div>
            <div style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "#7f1d1d" }}>{error}</div>
          </div>
        ) : null}

        <div
          ref={scrollRef}
          style={{
            height: "calc(100vh - 210px)",
            minHeight: 420,
            overflowY: "auto",
            paddingRight: 6,
          }}
        >
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div key={m.id} style={{ padding: "14px 0", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "78%" }}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                      {isUser ? "You" : "Opti"}
                    </div>
                    <div style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {m.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {busy ? (
            <div style={{ padding: "14px 0" }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Opti</div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: "#374151" }}>Thinking…</div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Composer */}
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, background: "#ffffff", borderTop: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "12px 16px", display: "flex", gap: 10 }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message Opti…"
            rows={2}
            style={{
              flex: 1,
              resize: "none",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #d1d5db",
              outline: "none",
              background: "#ffffff",
              color: "#111827",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          />
          <button
            onClick={send}
            disabled={!canSend}
            style={{
              width: 110,
              borderRadius: 10,
              border: "1px solid #d1d5db",
              background: canSend ? "#111827" : "#f3f4f6",
              color: canSend ? "#ffffff" : "#9ca3af",
              fontWeight: 700,
              cursor: canSend ? "pointer" : "not-allowed",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
