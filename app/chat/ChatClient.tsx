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
      id: uid("sys"),
      role: "assistant",
      content: "Hi — I'm Opti Chat. Ask me anything about Optimized Intelligence.",
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
    // Auto-scroll to bottom on new messages / busy changes
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    // Focus input on load
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

    // Enqueue
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
      setError(`Send failed (HTTP ${sendRes.status}). ${sendRes.text || ""}`.slice(0, 300));
      return;
    }

    // Poll
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
        setError(`Status failed (HTTP ${st.status}). ${st.text || ""}`.slice(0, 300));
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
        // Refocus input
        setTimeout(() => textareaRef.current?.focus(), 50);
        return;
      }

      if (state === "ERROR" || state === "FAILED") {
        setBusy(false);
        setError(`Task failed (state=${state}). ${JSON.stringify(st.json?.error || st.json).slice(0, 400)}`);
        return;
      }

      await sleep(350);
    }

    setBusy(false);
    setError(`Timeout waiting for reply (taskId=${taskId}, lastState=${lastState})`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter makes newline (standard AI chat behavior)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) send();
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0f14", color: "#e6edf3" }}>
      {/* Top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(11,15,20,0.92)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: busy ? "#f0b429" : "#2fbf71" }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.2 }}>Opti Chat</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>{busy ? "Thinking…" : "Ready"}</div>
            </div>
          </div>
          <a href="/opti" style={{ fontSize: 12, opacity: 0.85, textDecoration: "underline" }}>What is Opti?</a>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "18px 16px 110px" }}>
        {/* Error banner */}
        {error ? (
          <div style={{ marginBottom: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(255,90,90,0.35)", background: "rgba(255,90,90,0.08)" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Error</div>
            <div style={{ whiteSpace: "pre-wrap", fontSize: 13, opacity: 0.9 }}>{error}</div>
          </div>
        ) : null}

        {/* Messages */}
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
              <div key={m.id} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 10 }}>
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "10px 12px",
                    borderRadius: 16,
                    lineHeight: 1.35,
                    fontSize: 14,
                    whiteSpace: "pre-wrap",
                    border: isUser ? "1px solid rgba(64, 156, 255, 0.35)" : "1px solid rgba(255,255,255,0.10)",
                    background: isUser ? "rgba(64,156,255,0.12)" : "rgba(255,255,255,0.06)",
                    boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
                  }}
                >
                  <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 6 }}>
                    {isUser ? "You" : "Opti"}
                  </div>
                  {m.content}
                </div>
              </div>
            );
          })}

          {/* Typing bubble */}
          {busy ? (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
              <div
                style={{
                  maxWidth: "82%",
                  padding: "10px 12px",
                  borderRadius: 16,
                  fontSize: 14,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.06)",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
                }}
              >
                <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 6 }}>Opti</div>
                <span style={{ opacity: 0.8 }}>Thinking</span>
                <span style={{ opacity: 0.55 }}> …</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Composer */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(11,15,20,0.92)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "12px 16px", display: "flex", gap: 10 }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message Opti… (Enter to send, Shift+Enter for newline)"
            rows={2}
            style={{
              flex: 1,
              resize: "none",
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              outline: "none",
              background: "rgba(255,255,255,0.06)",
              color: "#e6edf3",
              fontSize: 14,
              lineHeight: 1.35,
            }}
          />
          <button
            onClick={send}
            disabled={!canSend}
            style={{
              width: 110,
              borderRadius: 14,
              border: "1px solid rgba(64,156,255,0.35)",
              background: canSend ? "rgba(64,156,255,0.20)" : "rgba(255,255,255,0.05)",
              color: canSend ? "#e6edf3" : "rgba(230,237,243,0.45)",
              fontWeight: 700,
              cursor: canSend ? "pointer" : "not-allowed",
            }}
          >
            {busy ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
