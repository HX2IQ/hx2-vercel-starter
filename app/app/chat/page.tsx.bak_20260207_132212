"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Page() {
  const [baseUrl, setBaseUrl] = useState("https://optinodeiq.com");
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "HX2 Retail Chat ready. Ask me something." },
  ]);
  const [lastRaw, setLastRaw] = useState<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // persist token so you don’t paste it every time
  useEffect(() => {
    const saved = localStorage.getItem("HX2_API_KEY") || "";
    if (saved) setToken(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("HX2_API_KEY", token || "");
  }, [token]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const canSend = useMemo(() => input.trim().length > 0 && !busy, [input, busy]);

  async function send() {
    if (!canSend) return;

    const userMsg: Msg = { role: "user", content: input.trim() };
    setInput("");
    setMessages((m) => [...m, userMsg]);
    setBusy(true);
    setLastRaw(null);

    const base = baseUrl.replace(/\/$/, "");
    const payload = {
      // brain chat expects Chat-like messages
      messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
    };

    try {
      const r = await fetch(`${base}/api/brain/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await r.text();
      let json: any;
      try { json = JSON.parse(text); } catch { json = { rawText: text }; }
      setLastRaw({ http: r.status, ok: r.ok, json });

      // accept a few possible response shapes
      const reply =
        json?.reply?.content ??
        json?.reply ??
        json?.assistant ??
        json?.message ??
        (json?.ok === false ? JSON.stringify(json, null, 2) : null);

      if (reply) {
        setMessages((m) => [...m, { role: "assistant", content: String(reply) }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: "(No reply returned — check Last Raw below)" }]);
      }
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `Error: ${e?.message || String(e)}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>HX2 Retail Chat</h1>
        <Link href="/app" style={{ fontWeight: 800 }}>← Back</Link>
      </div>

      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Chat UI → <code>/api/brain/chat</code>. Paste your HX2_API_KEY once; it will be saved locally in your browser.
      </p>

      <section style={{ display: "grid", gap: 12, padding: 12, border: "1px solid #e5e7eb", borderRadius: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 800 }}>Base URL</span>
          <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 800 }}>Authorization token (HX2_API_KEY)</span>
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste token" style={{ padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }} />
        </label>
      </section>

      <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, minHeight: 360 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 900, opacity: 0.8 }}>{m.role === "user" ? "You" : "HX2"}</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {busy && <div style={{ opacity: 0.7, fontWeight: 800 }}>Thinking…</div>}
        <div ref={endRef} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginTop: 12 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="Type your message…"
          style={{ padding: 10, borderRadius: 12, border: "1px solid #d1d5db", fontFamily: "inherit" }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") send();
          }}
        />
        <button
          onClick={send}
          disabled={!canSend}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #111827",
            background: canSend ? "#111827" : "#9ca3af",
            color: "white",
            fontWeight: 900,
            cursor: canSend ? "pointer" : "not-allowed",
            height: "100%",
          }}
        >
          Send
        </button>
      </div>

      <p style={{ marginTop: 8, opacity: 0.75 }}>
        Tip: Press <b>Ctrl+Enter</b> to send.
      </p>

      <h2 style={{ marginTop: 18, fontSize: 16, fontWeight: 900 }}>Last Raw</h2>
      <pre style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12 }}>
{lastRaw ? JSON.stringify(lastRaw, null, 2) : "(none yet)"}
      </pre>
    </main>
  );
}
