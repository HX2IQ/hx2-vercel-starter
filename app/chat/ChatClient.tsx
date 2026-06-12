"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./chat.css?v=18";

type Role = "user" | "assistant" | "system";
type MsgSource = {
  title?: string;
  url?: string;
  source?: string;
};

type Msg = {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  sources?: MsgSource[];
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function getSessionId(): string {
  const key = "hx2_session_id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const sid = "hx2-" + Math.random().toString(16).slice(2);
  sessionStorage.setItem(key, sid);
  return sid;
}

function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "0px";
  const next = Math.min(el.scrollHeight, 180);
  el.style.height = `${next}px`;
}

function extractSourcesFromPayload(payload: any): MsgSource[] {
  const out: MsgSource[] = [];

  const autoData = payload?.data?.auto_retrieval_data;
  const isYouTube = String(autoData?.source || "").toLowerCase() === "youtube";

  if (isYouTube) {
    const ytSeen = new Set<string>();

    const chosen = autoData?.chosen_video;
    if (chosen?.url) {
      const url = String(chosen.url).trim();
      if (url) {
        ytSeen.add(url);
        out.push({
          title: String(chosen?.title || "").trim(),
          url,
          source: "youtube",
        });
      }
    }

    const ytResults = Array.isArray(autoData?.search?.results) ? autoData.search.results : [];
    for (const r of ytResults) {
      const score = Number(r?._score || 0);
      const url = String(r?.url || "").trim();
      const title = String(r?.title || "").trim();

      if (!url || !title) continue;
      if (ytSeen.has(url)) continue;
      if (score < 12) continue;

      ytSeen.add(url);
      out.push({
        title,
        url,
        source: "youtube",
      });

      if (out.length >= 3) break;
    }

    return out;
  }

  const fetchedPages = autoData?.fetched_pages;
  if (Array.isArray(fetchedPages)) {
    for (const p of fetchedPages) {
      const title = String(p?.title || "").trim();
      const url = String(p?.url || "").trim();
      const source = String(p?.source || "fetched_page").trim();
      if (title || url) out.push({ title, url, source });
    }
  }

  const results = autoData?.results;
  if (Array.isArray(results)) {
    for (const r of results.slice(0, 5)) {
      const title = String(r?.title || "").trim();
      const url = String(r?.url || "").trim();
      const source = String(r?.source || autoData?.provider || "search").trim();
      if (title || url) out.push({ title, url, source });
    }
  }

  const direct = payload?.sources || payload?.data?.sources;
  if (Array.isArray(direct)) {
    for (const s of direct) {
      const title = String(s?.title || "").trim();
      const url = String(s?.url || "").trim();
      const source = String(s?.source || "").trim();
      if (title || url) out.push({ title, url, source });
    }
  }

  const seen = new Set<string>();
  return out.filter((x) => {
    const key = `${x.title || ""}|${x.url || ""}|${x.source || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5);
}

function getHostname(url?: string): string {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, "") : "";
  } catch {
    return "";
  }
}


function getFaviconUrl(url?: string, source?: string): string {
  if (String(source || "").toLowerCase() === "youtube") {
    return "https://www.youtube.com/s/desktop/fe7d0c56/img/favicon_32x32.png";
  }

  const host = getHostname(url);
  return host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : "";
}

function deriveHx2Envelope(payload: any) {
  const body = payload?.body || payload || {};
  const envelope = body?.envelope || body?.details?.envelope || body?.data?.envelope || {};
  const router = body?.router || body?.details?.router || envelope?.router || {};

  const node =
    envelope?.active_node ||
    body?.active_node ||
    router?.target_node ||
    router?.node ||
    "HX2";

  const rawConfidence =
    Number(
      envelope?.confidence ??
      body?.confidence ??
      router?.confidence ??
      0
    );

  const confidence =
    rawConfidence <= 1 && rawConfidence > 0
      ? Math.round(rawConfidence * 100)
      : Math.round(rawConfidence || 0);

  const memoryUsed =
    envelope?.memory_used === true ||
    body?.memory_used === true;

  const suggestedActions =
    Array.isArray(envelope?.suggested_actions)
      ? envelope.suggested_actions
      : Array.isArray(body?.suggested_actions)
        ? body.suggested_actions
        : [];

  const routingReason =
    envelope?.routing_reason ||
    router?.reasoning ||
    router?.reason ||
    body?.routing_reason ||
    "Awaiting routing decision";

  const relatedNodes =
    Array.isArray(envelope?.related_nodes)
      ? envelope.related_nodes
      : Array.isArray(body?.related_nodes)
        ? body.related_nodes
        : [];

  return {
    node: String(node || "HX2"),
    confidence,
    memoryUsed,
    routingReason: String(routingReason || "Awaiting routing decision"),
    relatedNodes: relatedNodes.slice(0, 5).map((x: any) => String(x)),
    suggestedActions: suggestedActions.slice(0, 3).map((x: any) => String(x))
  };
}

export default function ChatClient() {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [lastRaw, setLastRaw] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);

  const recognitionRef = useRef<any>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  useEffect(() => {
    setSessionId(getSessionId());

    const saved = localStorage.getItem("hx2_chat_messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch {}
    }

    setMessages([
      {
        id: uid(),
        role: "assistant",
        content: "## Opti is online\n\nAsk me to reason, build, inspect, activate, execute, or retrieve sources.",
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("hx2_chat_messages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    autoGrow(inputRef.current);
  }, [input]);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollerRef.current?.scrollTo({
        top: scrollerRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages.length, sending]);

  useEffect(() => {
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
      if (text) {
        setInput(text.trim());
      }
    };

    rec.onend = () => setIsRecording(false);
    rec.onerror = () => setIsRecording(false);

    recognitionRef.current = rec;
  }, []);

  function toggleVoice() {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    try {
      if (isRecording) {
        rec.stop();
        setIsRecording(false);
      } else {
        setInput("");
        setIsRecording(true);
        rec.start();
      }
    } catch {
      setIsRecording(false);
    }
  }

  function clearChat() {
    const fresh: Msg[] = [
      {
        id: uid(),
        role: "assistant",
        content: "## Opti cleared the chat\n\nWhat would you like to do next?",
        createdAt: new Date().toISOString(),
      },
    ];
    setMessages(fresh);
    localStorage.setItem("hx2_chat_messages", JSON.stringify(fresh));
    setLastRaw(null);
  }

  function copyMessage(content: string) {
    navigator.clipboard.writeText(content).catch(() => {});
  }

  function stopRequest() {
    abortRef.current?.abort();
    abortRef.current = null;
    setSending(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Msg = {
      id: uid(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const assistantId = uid();
    const assistantMsg: Msg = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };

    setMessages((m) => [...m, userMsg, assistantMsg]);
    setInput("");
    setSending(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const hdrs: Record<string, string> = {
        "Content-Type": "application/json",
        "x-hx2-stream": "1",
      };
      if (sessionId) hdrs["x-hx2-session"] = sessionId;

      const res = await fetch("/api/hx2/chat", {
        method: "POST",
        headers: hdrs,
        body: JSON.stringify({
          message: text,
          stream: true,
          conversation_context: messages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content
          }))
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const raw = await res.json().catch(() => ({}));
        const extractedSources = extractSourcesFromPayload(raw);
        setLastRaw({ status: res.status, body: raw });

        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: raw?.error || raw?.reply || "Request failed.",
                  sources: extractedSources,
                }
              : msg
          )
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalReply = "";
      let finalData: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const line = part.split("\n").find((x) => x.startsWith("data: "));
          if (!line) continue;

          let evt: any = null;
          try {
            evt = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (evt?.type === "delta") {
            finalReply += String(evt.delta || "");
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId ? { ...msg, content: finalReply } : msg
              )
            );
          }

          if (evt?.type === "done") {
            finalReply = String(evt.reply || finalReply || "");
            finalData = evt?.data || null;

            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId ? { ...msg, content: finalReply || "No reply." } : msg
              )
            );
          }

          if (evt?.type === "error") {
            const errText = String(evt.error || "Request failed.");
            finalReply = errText;

            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId ? { ...msg, content: errText } : msg
              )
            );
          }
        }
      }

      const finalPayload = {
        status: 200,
        body: {
          reply: finalReply,
          data: finalData,
        },
      };

      setLastRaw(finalPayload);

      const extractedSources = extractSourcesFromPayload(finalPayload.body);

      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId ? { ...msg, sources: extractedSources } : msg
        )
      );
    } catch (e: any) {
      const message =
        e?.name === "AbortError"
          ? "Request stopped."
          : `Error: ${e?.message || "Request failed"}`;

      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId ? { ...msg, content: message } : msg
        )
      );
    } finally {
      abortRef.current = null;
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
  const hx2Envelope = deriveHx2Envelope(lastRaw);

  return (
    <div className="hx2-shell">
      <header className="hx2-topbar">
        <div className="hx2-brand">
          <div className="hx2-title">Opti</div>
          <div className="hx2-subtitle">Optimized Intelligence</div>
        </div>

        <div className="hx2-intel-strip" aria-label="HX2 intelligence status">
          <div className="hx2-intel-chip">
            Node: <span>{hx2Envelope.node}</span>
          </div>
          <div className="hx2-intel-chip">
            Confidence: <span>{hx2Envelope.confidence ? `${hx2Envelope.confidence}%` : "pending"}</span>
          </div>
          <div className={`hx2-intel-chip ${hx2Envelope.memoryUsed ? "hx2-intel-chip-on" : ""}`}>
            Memory: <span>{hx2Envelope.memoryUsed ? "used" : "standby"}</span>
          </div>
        </div>

        <div className="hx2-top-actions">

          <button className="hx2-pill" onClick={clearChat}>Clear</button>
          <button className="hx2-pill" onClick={() => setDebugOpen((v) => !v)}>
            {debugOpen ? "Hide Debug" : "Debug"}
          </button>
        </div>
      </header>

      <main className="hx2-chat" ref={scrollerRef}>
        <div className="hx2-chat-inner">
          {messages.map((m) => (
            <section key={m.id} className={`hx2-message ${m.role === "user" ? "hx2-message-user" : "hx2-message-assistant"}`}>
              <div className="hx2-message-meta">
                <span className="hx2-role">{m.role === "user" ? "You" : "Opti"}</span>
                <button className="hx2-copy" onClick={() => copyMessage(m.content)}>Copy</button>
              </div>
              <div className="hx2-message-body markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => <h1 className="hx2-md-h1">{children}</h1>,
                    h2: ({children}) => <h2 className="hx2-md-h2">{children}</h2>,
                    h3: ({children}) => <h3 className="hx2-md-h3">{children}</h3>,
                    p: ({children}) => <p className="hx2-md-p">{children}</p>,
                    ul: ({children}) => <ul className="hx2-md-ul">{children}</ul>,
                    ol: ({children}) => <ol className="hx2-md-ol">{children}</ol>,
                    li: ({children}) => <li className="hx2-md-li">{children}</li>,
                    strong: ({children}) => <strong className="hx2-md-strong">{children}</strong>,
                    code: ({children}) => <code className="hx2-md-code">{children}</code>,
                    pre: ({children}) => <pre className="hx2-md-pre">{children}</pre>,
                    blockquote: ({children}) => <blockquote className="hx2-md-blockquote">{children}</blockquote>,
                  }}
                >
                  {m.content || (m.role === "assistant" && sending ? "…" : "")}
                </ReactMarkdown>

                {m.role === "assistant" && Array.isArray(m.sources) && m.sources.length > 0 && (
                  <div className="hx2-source-chips">
                    {m.sources.slice(0, 5).map((s, i) => {
                      const host = getHostname(s.url);
                      const icon = getFaviconUrl(s.url, s.source);
                      return (
                        <a
                          key={i}
                          className="hx2-source-chip"
                          href={s.url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          title={s.title || host || "Source"}
                        >
                          {icon ? (
                            <img className="hx2-source-chip-icon" src={icon} alt="" />
                          ) : (
                            <span className="hx2-source-chip-icon hx2-source-chip-icon-fallback">•</span>
                          )}
                          <span className="hx2-source-chip-label">
                            {s.source === "youtube"
                              ? (s.title || "YouTube")
                              : (host || s.title || "Source")}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
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
                autoGrow(e.target as HTMLTextAreaElement);
              }}
              onKeyDown={onKeyDown}
              rows={1}
            />
          </div>

          {sending ? (
            <button className="hx2-send hx2-stop" onClick={stopRequest}>Stop</button>
          ) : (
            <button className="hx2-send" onClick={send} disabled={!canSend}>Send</button>
          )}
        </div>

        {Array.isArray(sources) && sources.length > 0 && (
          <div className="hx2-sources">
            <div className="hx2-sources-title">Sources</div>
            <ul className="hx2-sources-list">
              {sources.map((s: any, i: number) => (
                <li key={i}>
                  <a href={s?.url} target="_blank" rel="noreferrer">
                    {s?.title ? `${s.title} — ` : ""}
                    {s?.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="hx2-node-workspace">
          <div className="hx2-node-workspace-head">
            <div>
              <div className="hx2-node-kicker">HX2 Workspace</div>
              <div className="hx2-node-title">{hx2Envelope.node}</div>
            </div>
            <div className="hx2-node-confidence">
              {hx2Envelope.confidence ? `${hx2Envelope.confidence}%` : "pending"}
            </div>
          </div>

          <div className="hx2-node-grid">
            <div className="hx2-node-card">
              <div className="hx2-node-label">Routing Reason</div>
              <div className="hx2-node-value">{hx2Envelope.routingReason}</div>
            </div>

            <div className="hx2-node-card">
              <div className="hx2-node-label">Memory</div>
              <div className="hx2-node-value">{hx2Envelope.memoryUsed ? "Conversation context used" : "No memory used yet"}</div>
            </div>

            <div className="hx2-node-card">
              <div className="hx2-node-label">Related Nodes</div>
              <div className="hx2-node-value">
                {hx2Envelope.relatedNodes.length ? hx2Envelope.relatedNodes.join(", ") : "None reported"}
              </div>
            </div>
          </div>
        </div>

        {hx2Envelope.suggestedActions.length > 0 && (
          <div className="hx2-suggestions">
            <div className="hx2-suggestions-title">Suggested Actions</div>
            <div className="hx2-suggestions-list">
              {hx2Envelope.suggestedActions.map((action) => (
                <button
                  key={action}
                  className="hx2-suggestion-chip"
                  type="button"
                  onClick={() => setInput(action)}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {debugOpen && (
          <div className="hx2-debug">
            <pre className="hx2-debugbox">{JSON.stringify(lastRaw, null, 2)}</pre>
          </div>
        )}
      </footer>
    </div>
  );
}






























