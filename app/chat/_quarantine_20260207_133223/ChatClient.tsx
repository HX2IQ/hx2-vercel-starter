"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "HX2 online. What are we building today?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const convoId = useMemo(() => "convo_" + uid(), []);

  // Auto-scroll on new message and while typing
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, input, sending]);

  // Poll task status when we have a taskId
  useEffect(() => {
    if (!taskId) return;

    let alive = true;
    let tries = 0;

    async function tick() {
      tries++;
      try {
        const res = await fetch("/api/chat/poll", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ taskId }),
        });

        const json = await res.json().catch(() => ({}));
        const s = json?.status || {};
        const state = (s?.state || "").toString().toUpperCase();

        if (s?.found && (state === "DONE" || state === "FAILED" || state === "COMPLETED")) {
          const replyText =
            s?.result?.reply?.content ||
            s?.result?.response?.data?.reply?.content ||
            s?.result?.response?.data?.content ||
            s?.result?.result?.reply?.content ||
            s?.result?.brain?.reply?.content ||
            s?.result?.content ||
            s?.result?.reply ||
            (state === "FAILED" ? ("Error: " + (s?.error?.message || JSON.stringify(s?.error || {}))) : "");

          setMessages((m) => [...m, { role: "assistant", content: String(replyText || "(No reply)") }]);
          setTaskId(null);
          setSending(false);
          return;
        }
      } catch (e: any) {
        setMessages((m) => [...m, { role: "assistant", content: "Error: " + String(e?.message || e) }]);
        setTaskId(null);
        setSending(false);
        return;
      }

      if (!alive) return;

      // Poll up to ~45s (150 * 300ms)
      if (tries < 150) {
        setTimeout(tick, 300);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: "(Still processing… try again.)" }]);
        setTaskId(null);
        setSending(false);
      }
    }

    tick();
    return () => { alive = false; };
  }, [taskId]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId: convoId, messages: next }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok || !json?.taskId) {
        setMessages((m) => [...m, { role: "assistant", content: "Send failed: " + JSON.stringify(json) }]);
        setSending(false);
        return;
      }

      setTaskId(String(json.taskId));
      // sending stays true until poll returns
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: "Error: " + String(e?.message || e) }]);
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col">
        <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="font-semibold">HX2 Chat</div>
            <div className="text-xs text-zinc-500">Premium UI</div>
          </div>
        </header>

        <main className="flex-1 px-4 py-4 pb-28 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={[
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border",
                  m.role === "user"
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-900 border-zinc-200",
                ].join(" ")}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm border bg-white border-zinc-200 text-zinc-500">
                Thinking…
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </main>

        <footer className="fixed bottom-0 left-0 right-0 border-t bg-white">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Message HX2…"
                className="flex-1 resize-none rounded-2xl border border-zinc-300 bg-white text-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-500 placeholder:text-zinc-400"
              />
              <button
                onClick={send}
                disabled={sending || !input.trim()}
                className="rounded-2xl px-4 py-3 text-sm font-medium bg-zinc-900 text-white disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">
              No keys in browser. Server-only auth. HX2 → AP2 → brain.chat.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}


