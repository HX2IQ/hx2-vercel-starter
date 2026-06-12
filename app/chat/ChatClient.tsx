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

type ChatThread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Msg[];
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const THREADS_KEY = "hx2_chat_threads_v2";
const ACTIVE_THREAD_KEY = "hx2_active_thread_id";

function defaultAssistantMessage(content = "## Opti is online\n\nAsk me anything."): Msg {
  return {
    id: uid(),
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
  };
}

function titleFromMessage(text: string): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return "New chat";
  return clean.length > 42 ? clean.slice(0, 42) + "…" : clean;
}

function createThread(title = "New chat", messages?: Msg[]): ChatThread {
  const now = new Date().toISOString();
  return {
    id: "thread-" + uid(),
    title,
    createdAt: now,
    updatedAt: now,
    messages: messages || [defaultAssistantMessage()],
  };
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
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [lastRaw, setLastRaw] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);

  const recognitionRef = useRef<any>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) || threads[0] || null,
    [threads, activeThreadId]
  );

  const messages = activeThread?.messages || [];

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  function persistThreads(next: ChatThread[], activeId = activeThreadId) {
    setThreads(next);
    try {
      localStorage.setItem(THREADS_KEY, JSON.stringify(next));
      if (activeId) localStorage.setItem(ACTIVE_THREAD_KEY, activeId);
    } catch {}
  }

  function setActiveMessages(updater: (messages: Msg[]) => Msg[]) {
    setThreads((current) => {
      const targetId = activeThreadId || current[0]?.id;
      const next = current.map((thread) => {
        if (thread.id !== targetId) return thread;
        return {
          ...thread,
          messages: updater(thread.messages),
          updatedAt: new Date().toISOString(),
        };
      });

      try {
        localStorage.setItem(THREADS_KEY, JSON.stringify(next));
      } catch {}

      return next;
    });
  }

  function startNewChat() {
    const thread = createThread();
    const next = [thread, ...threads];
    setActiveThreadId(thread.id);
    persistThreads(next, thread.id);
    setHistoryOpen(false);
    setLastRaw(null);
    setInput("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function selectThread(id: string) {
    setActiveThreadId(id);
    try {
      localStorage.setItem(ACTIVE_THREAD_KEY, id);
    } catch {}
    setHistoryOpen(false);
    setLastRaw(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function deleteThread(id: string) {
    const remaining = threads.filter((t) => t.id !== id);
    const next = remaining.length > 0 ? remaining : [createThread()];
    const nextActive = activeThreadId === id ? next[0].id : activeThreadId;
    setActiveThreadId(nextActive);
    persistThreads(next, nextActive);
  }

  useEffect(() => {
    setSessionId(getSessionId());

    try {
      const savedThreads = localStorage.getItem(THREADS_KEY);
      const savedActive = localStorage.getItem(ACTIVE_THREAD_KEY);

      if (savedThreads) {
        const parsed = JSON.parse(savedThreads);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setThreads(parsed);
          setActiveThreadId(
            savedActive && parsed.some((t: ChatThread) => t.id === savedActive)
              ? savedActive
              : parsed[0].id
          );
          return;
        }
      }

      const legacy = localStorage.getItem("hx2_chat_messages");
      if (legacy) {
        const legacyMessages = JSON.parse(legacy);
        if (Array.isArray(legacyMessages) && legacyMessages.length > 0) {
          const migrated = createThread("Previous chat", legacyMessages);
          setThreads([migrated]);
          setActiveThreadId(migrated.id);
          localStorage.setItem(THREADS_KEY, JSON.stringify([migrated]));
          localStorage.setItem(ACTIVE_THREAD_KEY, migrated.id);
          return;
        }
      }
    } catch {}

    const thread = createThread();
    setThreads([thread]);
    setActiveThreadId(thread.id);
    try {
      localStorage.setItem(THREADS_KEY, JSON.stringify([thread]));
      localStorage.setItem(ACTIVE_THREAD_KEY, thread.id);
    } catch {}
  }, []);
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
    setActiveMessages(() => fresh);
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

    setActiveMessages((m) => [...m, userMsg, assistantMsg]);

    const currentThreadId = activeThreadId;
    if (activeThread && activeThread.title === "New chat") {
      const nextTitle = titleFromMessage(text);
      setThreads((current) => {
        const next = current.map((thread) =>
          thread.id === currentThreadId
            ? { ...thread, title: nextTitle, updatedAt: new Date().toISOString() }
            : thread
        );
        try { localStorage.setItem(THREADS_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    }
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

        setActiveMessages((m) =>
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
            setActiveMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId ? { ...msg, content: finalReply } : msg
              )
            );
          }

          if (evt?.type === "done") {
            finalReply = String(evt.reply || finalReply || "");
            finalData = evt?.data || null;

            setActiveMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId ? { ...msg, content: finalReply || "No reply." } : msg
              )
            );
          }

          if (evt?.type === "error") {
            const errText = String(evt.error || "Request failed.");
            finalReply = errText;

            setActiveMessages((m) =>
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

      setActiveMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId ? { ...msg, sources: extractedSources } : msg
        )
      );
    } catch (e: any) {
      const message =
        e?.name === "AbortError"
          ? "Request stopped."
          : `Error: ${e?.message || "Request failed"}`;

      setActiveMessages((m) =>
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
    <div className={`hx2-shell ${historyOpen ? "hx2-history-open" : ""}`}>
      <aside className="hx2-history">
        <div className="hx2-history-head">
          <div>
            <div className="hx2-history-title">Chats</div>
            <div className="hx2-history-subtitle">Recent HX2 conversations</div>
          </div>
          <button className="hx2-history-close" type="button" onClick={() => setHistoryOpen(false)}>×</button>
        </div>

        <button className="hx2-new-chat" type="button" onClick={startNewChat}>+ New Chat</button>

        <div className="hx2-thread-list">
          {threads.map((thread) => (
            <div key={thread.id} className={`hx2-thread-row ${thread.id === activeThreadId ? "hx2-thread-row-active" : ""}`}>
              <button className="hx2-thread-button" type="button" onClick={() => selectThread(thread.id)}>
                <span className="hx2-thread-title">{thread.title}</span>
                <span className="hx2-thread-date">{new Date(thread.updatedAt).toLocaleDateString()}</span>
              </button>
              <button className="hx2-thread-delete" type="button" onClick={() => deleteThread(thread.id)}>×</button>
            </div>
          ))}
        </div>
      </aside>

      {historyOpen && <button className="hx2-history-scrim" aria-label="Close history" onClick={() => setHistoryOpen(false)} />}
      <header className="hx2-topbar">
        <button className="hx2-menu-button" type="button" onClick={() => setHistoryOpen(true)} aria-label="Open chat history">☰</button>
        <div className="hx2-brand">
          <div className="hx2-title">Opti</div>
          <div className="hx2-subtitle">Optimized Intelligence</div>
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
            <span className={isRecording ? "hx2-mic-icon hx2-mic-icon-recording" : "hx2-mic-icon"} aria-hidden="true" />
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


































