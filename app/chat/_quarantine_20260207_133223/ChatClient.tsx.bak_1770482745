"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Role = "user" | "assistant" | "system";
type Msg = { role: Role; content: string };

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isProbablyInlineCode(children: React.ReactNode) {
  // react-markdown typings vary across versions; don't rely on `inline`.
  const s = String(children ?? "");
  return !s.includes("\n") && s.length <= 120;
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationId = useMemo(() => `convo_${Date.now()}`, []);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = !busy && input.trim().length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setError(null);
    setBusy(true);

    // optimistic append user message
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    try {
      const ts = Date.now();

      const sendRes = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          conversationId,
          messages: [{ role: "user", content: text }],
          ts,
        }),
      });

      const sendJson = await sendRes.json().catch(() => null);
      const taskId: string | undefined = sendJson?.taskId;

      if (!sendRes.ok || !taskId) {
        setBusy(false);
        setError(`Send failed: ${sendJson?.error || sendRes.statusText || "unknown_error"}`);
        return;
      }

      const pollBody = JSON.stringify({ mode: "SAFE", taskId });

      for (let i = 0; i < 40; i++) {
        const stRes = await fetch("/api/chat/status", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: pollBody,
        });

        const st = await stRes.json().catch(() => null);

        if (st?.found && String(st?.state || "").match(/DONE|FAILED|ERROR|COMPLETED/)) {
          const reply =
            st?.result?.data?.reply ??
            st?.result?.reply ??
            st?.reply ??
            st?.result?.data ??
            null;

          if (String(st?.state || "") === "DONE" && typeof reply === "string") {
            setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
            setBusy(false);
            return;
          }

          setBusy(false);
          setError(`Task ${taskId} failed: ${st?.error || st?.result?.error || "unknown_error"}`);
          return;
        }

        await sleep(350);
      }

      setBusy(false);
      setError(`Timeout waiting for reply (taskId=${taskId})`);
    } catch (e: any) {
      setBusy(false);
      setError(e?.message || "Unknown error");
    } finally {
      // keep cursor ready
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#111827" }}>
      {/* Top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            maxWidth: 920,
            margin: "0 auto",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>OI Chat</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Optimized Intelligence</div>
          </div>

          <a
            href="/opti"
            style={{ fontSize: 12, textDecoration: "underline", opacity: 0.85 }}
          >
            What is Opti?
          </a>
        </div>
      </div>

      {/* Messages */}
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "18px 16px 120px" }}>
        {messages.length === 0 ? (
          <div style={{ padding: "28px 0", color: "#6b7280", fontSize: 14 }}>
            Ask anything to begin.
          </div>
        ) : (
          messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div key={idx} style={{ padding: "14px 0", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                  {isUser ? "You" : "OI"}
                </div>

                {/* No bubbles — paragraph style */}
                <div style={{ fontSize: 15, lineHeight: 1.55 }}>
                  <ReactMarkdown
                    components={{
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          style={{ textDecoration: "underline" }}
                        >
                          {children}
                        </a>
                      ),
                      code: ({ children, className }) => {
                        const inline = !className && isProbablyInlineCode(children);
                        if (inline) {
                          return (
                            <code
                              style={{
                                padding: "2px 6px",
                                borderRadius: 6,
                                background: "#f3f4f6",
                                border: "1px solid #e5e7eb",
                                fontSize: 13,
                              }}
                            >
                              {children}
                            </code>
                          );
                        }
                        return (
                          <pre
                            style={{
                              marginTop: 10,
                              padding: 12,
                              overflowX: "auto",
                              borderRadius: 12,
                              background: "#f9fafb",
                              border: "1px solid #e5e7eb",
                              fontSize: 13,
                              lineHeight: 1.5,
                            }}
                          >
                            <code className={className}>{children}</code>
                          </pre>
                        );
                      },
                      ul: ({ children }) => <ul style={{ paddingLeft: 22, marginTop: 10 }}>{children}</ul>,
                      ol: ({ children }) => <ol style={{ paddingLeft: 22, marginTop: 10 }}>{children}</ol>,
                      li: ({ children }) => <li style={{ margin: "6px 0" }}>{children}</li>,
                      p: ({ children }) => <p style={{ margin: "10px 0" }}>{children}</p>,
                      h1: ({ children }) => <h1 style={{ fontSize: 22, margin: "12px 0" }}>{children}</h1>,
                      h2: ({ children }) => <h2 style={{ fontSize: 18, margin: "12px 0" }}>{children}</h2>,
                      h3: ({ children }) => <h3 style={{ fontSize: 16, margin: "12px 0" }}>{children}</h3>,
                      blockquote: ({ children }) => (
                        <blockquote
                          style={{
                            borderLeft: "3px solid #e5e7eb",
                            paddingLeft: 12,
                            color: "#374151",
                            margin: "12px 0",
                          }}
                        >
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })
        )}

        {busy ? (
          <div style={{ padding: "16px 0", color: "#6b7280", fontSize: 14 }}>
            Thinking…
          </div>
        ) : null}

        {error ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontSize: 13,
              whiteSpace: "pre-wrap",
            }}
          >
            {error}
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      {/* Bottom input bar */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            maxWidth: 920,
            margin: "0 auto",
            padding: "12px 16px",
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            placeholder="Message…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (canSend) send();
              }
            }}
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              minHeight: 52,
              maxHeight: 160,
              padding: "14px 14px",
              borderRadius: 16,
              border: "1px solid #d1d5db",
              outline: "none",
              fontSize: 15,
              lineHeight: 1.35,
              background: "#ffffff",
              boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
            }}
          />

          {/* Arrow-up send */}
          <button
            onClick={send}
            disabled={!canSend}
            aria-label="Send"
            title="Send"
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              border: "1px solid #d1d5db",
              background: canSend ? "#111827" : "#f3f4f6",
              color: canSend ? "#ffffff" : "#9ca3af",
              cursor: canSend ? "pointer" : "not-allowed",
              display: "grid",
              placeItems: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 19V5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M7 10l5-5 5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
