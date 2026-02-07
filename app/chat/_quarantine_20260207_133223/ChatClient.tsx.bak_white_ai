"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

function SendArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 20L21 12L3 4V10L15 12L3 14V20Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Msg[]>(() => ([
    {
      id: uid("a"),
      role: "assistant",
      content: "Hi — I’m Opti. Ask me anything about Optimized Intelligence.",
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

  // Auto-grow textarea (within bounds)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(180, Math.max(56, el.scrollHeight));
    el.style.height = `${next}px`;
  }, [input]);

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
    // Enter sends; Shift+Enter newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) send();
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#111827" }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#ffffff", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Opti</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{busy ? "Thinking…" : "Ready"}</div>
          </div>
          <a href="/opti" style={{ fontSize: 12, color: "#2563eb", textDecoration: "underline" }}>What is Opti?</a>
        </div>
      </div>

      {/* Transcript */}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "16px 16px 140px" }}>
        {error ? (
          <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Error</div>
            <div style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "#7f1d1d" }}>{error}</div>
          </div>
        ) : null}

        <div
          ref={scrollRef}
          style={{
            height: "calc(100vh - 235px)",
            minHeight: 460,
            overflowY: "auto",
            paddingRight: 6,
          }}
        >
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div key={m.id} style={{ padding: "16px 0", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "82%" }}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                      {isUser ? "You" : "Opti"}
                    </div>

                    <div style={{ fontSize: 15, lineHeight: 1.7 }}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p style={{ margin: "0 0 12px 0" }}>{children}</p>,
                          ul: ({ children }) => <ul style={{ margin: "0 0 12px 18px" }}>{children}</ul>,
                          ol: ({ children }) => <ol style={{ margin: "0 0 12px 18px" }}>{children}</ol>,
                          li: ({ children }) => <li style={{ margin: "6px 0" }}>{children}</li>,
                          a: ({ href, children }) => (
                            <a href={href} style={{ color: "#2563eb", textDecoration: "underline" }}>
                              {children}
                            </a>
                          ),
                          code: ({ inline, children }) => {
                            if (inline) {
                              return (
                                <code style={{ padding: "2px 6px", borderRadius: 6, background: "#f3f4f6", border: "1px solid #e5e7eb", fontSize: 13 }}>
                                  {children}
                                </code>
                              );
                            }
                            return (
                              <code style={{ fontSize: 13 }}>
                                {children}
                              </code>
                            );
                          },
                          pre: ({ children }) => (
                            <pre style={{ margin: "0 0 12px 0", padding: 12, borderRadius: 10, background: "#f9fafb", border: "1px solid #e5e7eb", overflowX: "auto" }}>
                              {children}
                            </pre>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote style={{ margin: "0 0 12px 0", paddingLeft: 12, borderLeft: "3px solid #e5e7eb", color: "#374151" }}>
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {busy ? (
            <div style={{ padding: "16px 0" }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Opti</div>
              <div style={{ fontSize: 15, lineHeight: 1.7, color: "#374151" }}>Thinking…</div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Composer */}
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, background: "#ffffff", borderTop: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "12px 16px 18px" }}>
          <div style={{ position: "relative" }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message Opti… (Enter to send, Shift+Enter for newline)"
              rows={2}
              style={{
                width: "100%",
                resize: "none",
                padding: "14px 52px 14px 14px",
                borderRadius: 14,
                border: "1px solid #d1d5db",
                outline: "none",
                background: "#ffffff",
                color: "#111827",
                fontSize: 15,
                lineHeight: 1.5,
                boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
              }}
            />

            {/* Send arrow (only when text is present) */}
            {canSend ? (
              <button
                onClick={send}
                aria-label="Send"
                style={{
                  position: "absolute",
                  right: 10,
                  bottom: 10,
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  border: "1px solid #111827",
                  background: "#111827",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <SendArrowIcon />
              </button>
            ) : null}
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            {busy ? "Opti is thinking…" : "Tip: Shift+Enter inserts a new line."}
          </div>
        </div>
      </div>
    </div>
  );
}
