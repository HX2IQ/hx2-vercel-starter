"use client";

import React, { useMemo, useState } from "react";

function getSessionId(): string {
  const key = "hx2_session_id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const sid = "owner-ui-" + Math.random().toString(16).slice(2);
  sessionStorage.setItem(key, sid);
  return sid;
}

export default function CommandRunner() {
  const [sessionId, setSessionId] = useState<string>("");
  const [payload, setPayload] = useState<string>(
`{
  "mode": "SAFE",
  "command": "brain.health"
}`
  );
  const [out, setOut] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useMemo(() => {
    if (!sessionId) setSessionId(getSessionId());
  }, [sessionId]);

  async function run() {
    setBusy(true);
    setOut(null);
    try {
      const hdrs: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionId) hdrs["x-hx2-session"] = sessionId;

      const res = await fetch("/api/oi/command", {
        method: "POST",
        headers: hdrs,
        body: payload,
      });

      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch { data = { ok: false, raw: text }; }
      setOut(data);
    } catch (e: any) {
      setOut({ ok: false, error: String(e?.message || e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, marginTop: 12 }}>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>Command Runner</div>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
        Session: <span style={{ fontFamily: "monospace" }}>{sessionId || "—"}</span>
      </div>

      <textarea
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
        rows={8}
        style={{ width: "100%", fontFamily: "monospace", fontSize: 12, padding: 10, borderRadius: 10 }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <button
          onClick={run}
          disabled={busy}
          style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", fontWeight: 700 }}
        >
          {busy ? "Running…" : "Run"}
        </button>

        <button
          onClick={() => setPayload(`{ "mode": "SAFE", "command": "brain.status" }`)}
          disabled={busy}
          style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd" }}
        >
          brain.status
        </button>

        <button
          onClick={() => setPayload(`{ "mode": "SAFE", "command": "brain.memory.tail", "n": 10 }`)}
          disabled={busy}
          style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd" }}
        >
          tail(10)
        </button>

        <button
          onClick={() => setPayload(`{ "mode": "SAFE", "command": "chat.send", "message": "Store this exact fact to memory: CONSOLE_SMOKE" }`)}
          disabled={busy}
          style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd" }}
        >
          chat.send smoke
        </button>
      </div>

      <pre style={{ marginTop: 10, whiteSpace: "pre-wrap", fontSize: 12, background: "#fafafa", padding: 10, borderRadius: 10 }}>
        {out ? JSON.stringify(out, null, 2) : "—"}
      </pre>
    </div>
  );
}