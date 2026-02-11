"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "./chat.css?v=3";

type Role = "user" | "assistant" | "system";
type Msg = { id: string; role: Role; content: string };

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function getSessionId(): string {
  const key = "hx2_session_id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const sid = "owner-ui-" + Math.random().toString(16).slice(2);
  sessionStorage.setItem(key, sid);
  return sid;
}

function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "0px";
  const next = Math.min(el.scrollHeight, 160); // cap so it doesn’t take over the screen
  el.style.height = `${next}px`;
}

export default function ChatClient() {
  const [sessionId, setSessionId] = useState<string>("");

  const [messages, setMessages] = useState<Msg[]>([
    { id: uid(), role: "assistant", content: "Hi Dan — HX2 is online. What are we working on?" },
  ]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [useWeb, setUseWeb] = useState(false);

  const [debugOpen, setDebugOpen] = useState(false);
  const [lastRaw, setLastRaw] = useState<any>(null);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  useEffect(() => setSessionId(getSessionId()), []);

  useEffect(() => {
    autoGrow(inputRef.current);
  }, [input]);

  useEffect(() => {
    // auto-scroll to bottom on new message
    requestAnimationFrame(() => {
      scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
    });
  }, [messages.length]);

  useEffect(() => {
    // SpeechRecognition (Chrome/Android uses webkitSpeechRecognition)
    const AnyWin: any = window as any;
    const SR = AnyWin.SpeechRecognition || AnyWin.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: any) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0]?.transcript || "";
      }
      if (text) setInput((v) => (v ? (v + " " + text) : text));
    };

    rec.onend = () => setIsRecording(false);
    rec.onerror = () => setIsRecording(false);

    recognitionRef.current = rec;
  }, []);

  function toggleVoice() {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("Voice input not supported in this browser.");
      return;
    }
    try {
      if (isRecording) {
        rec.stop();
        setIsRecording(false);
      } else {
        setIsRecording(true);
        rec.start();
      }
    } catch {
      setIsRecording(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSending(true);

    const userMsg: Msg = { id: uid(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);

    try {
      const hdrs: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionId) hdrs["x-hx2-session"] = sessionId;

      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: hdrs,
        body: JSON.stringify({ message: text, use_web: useWeb }),
      });

      const raw = await res.json().catch(() => ({}));
      setLastRaw({ status: res.status, headers: Object.fromEntries(res.headers.entries()), body: raw });

      const reply =
        raw?.reply ??
        raw?.data?.reply ??
        raw?.data?.message ??
        raw?.message ??
        (typeof raw === "string" ? raw : null) ??
        "No reply.";

      // Append assistant message normally
      const assistantMsg: Msg = { id: uid(), role: "assistant", content: String(reply) };
      setMessages((m) => [...m, assistantMsg]);
    } catch (e: any) {
      const assistantMsg: Msg = { id: uid(), role: "assistant", content: `Error: ${e?.message || "Request failed"}` };
      setMessages((m) => [...m, assistantMsg]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const sources = lastRaw?.body?.sources || lastRaw?.body?.data?.sources || [];

  return (
    <div className="hx2-shell">
      <header className="hx2-topbar">
        <button className="hx2-iconbtn" aria-label="Menu" onClick={() => setDebugOpen((v) => !v)}>
          ☰
        </button>

        <div className="hx2-titlewrap">
          <div className="hx2-title">Opti</div>
          <div className="hx2-subtitle">Optimized Intelligence</div>
        </div>

        <button
          className="hx2-pill"
          aria-label="Toggle web"
          onClick={() => setUseWeb((v) => !v)}
          title="When ON, HX2 pulls fresh web sources when needed."
        >
          {useWeb ? "Web: ON" : "Web: OFF"}
        </button>
      </header>

      <main className="hx2-chat" ref={scrollerRef}>
        <div className="hx2-chat-inner">
          {messages.map((m) => (
            <div key={m.id} className={`hx2-row ${m.role === "user" ? "hx2-row-user" : "hx2-row-assistant"}`}>
              <div className={`hx2-bubble ${m.role === "user" ? "hx2-bubble-user" : "hx2-bubble-assistant"}`}>
                {m.content}
              </div>
            </div>
          ))}
          <div className="hx2-spacer" />
        </div>
      </main>

      <footer className="hx2-composer">
        <div className="hx2-composer-inner">
          <button className="hx2-iconbtn" aria-label="Voice" onClick={toggleVoice}>
            {isRecording ? "■" : "🎤"}
          </button>

          <div className="hx2-inputwrap">
            <textarea
              ref={inputRef}
              className="hx2-input"
              placeholder="Ask Opti"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoGrow(e.target as any);
              }}
              onKeyDown={onKeyDown}
              rows={1}
            />
          </div>

          <button className="hx2-send" onClick={send} disabled={!canSend} aria-label="Send">
            {sending ? "…" : "➤"}
          </button>
        </div>

        <div className="hx2-debug">
          <button className="hx2-debug-toggle" onClick={() => setDebugOpen((v) => !v)}>
            {debugOpen ? "▼ Debug" : "▶ Debug"}
          </button>

          {debugOpen && (
            <>
              {Array.isArray(sources) && sources.length > 0 && (
                <div className="hx2-sources">
                  <div className="hx2-sources-title">Sources</div>
                  <ul className="hx2-sources-list">
                    {sources.map((s: any, i: number) => (
                      <li key={i}>
                        <a href={s?.url} target="_blank" rel="noreferrer">{s?.title ? `${s.title} — ` : ""}{s?.url}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <pre className="hx2-debugbox">{JSON.stringify(lastRaw, null, 2)}</pre>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}