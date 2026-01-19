"use client";

import React, { useMemo, useState } from "react";

type EnqueueResponse = any;

const DEFAULT_TASKS = [
  "ping",
  "status.report",
  "ap2.diagnostics",
  "scaffold.node",
  "registry.register",
  "t2.analyze",
  "factcheck.verify",
  "health.score",
  "shop.find",
  "infra.run",
  "code.patch",
  "trigger.vercel.redeploy",
];

export default function ConsolePage() {
  const [baseUrl, setBaseUrl] = useState<string>("https://optinodeiq.com");
  const [token, setToken] = useState<string>(""); // Owner paste (64-char HX2_API_KEY)
  const [taskType, setTaskType] = useState<string>("t2.analyze");
  const [payloadText, setPayloadText] = useState<string>(JSON.stringify({ hello: "world" }, null, 2));
  const [busy, setBusy] = useState<boolean>(false);
  const [log, setLog] = useState<Array<{ ts: string; ok: boolean; taskType: string; res: any }>>([]);

  const tasks = useMemo(() => DEFAULT_TASKS, []);

  function pushLog(ok: boolean, res: any) {
    setLog((prev) => [
      { ts: new Date().toISOString(), ok, taskType, res },
      ...prev,
    ].slice(0, 25));
  }

  async function enqueue() {
    setBusy(true);
    try {
      let payload: any = {};
      try {
        payload = payloadText?.trim() ? JSON.parse(payloadText) : {};
      } catch (e: any) {
        pushLog(false, { error: "Payload JSON invalid", detail: e?.message });
        setBusy(false);
        return;
      }

      const id = `${taskType}-${Math.floor(Date.now() / 1000)}`;
      const body = { taskType, id, payload };

      const r = await fetch(`${baseUrl.replace(/\/$/, "")}/api/ap2/task/enqueue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const text = await r.text();
      let json: any;
      try { json = JSON.parse(text); } catch { json = { raw: text }; }

      if (!r.ok) {
        pushLog(false, { http: r.status, response: json });
      } else {
        pushLog(true, json);
      }
    } catch (e: any) {
      pushLog(false, { error: e?.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>HX2 Owner Console</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Terminal-less task runner (owner use). Paste your <b>HX2 API key</b> (64-char) to authenticate.
      </p>

      <section style={{ display: "grid", gap: 12, padding: 12, border: "1px solid #e5e7eb", borderRadius: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 700 }}>Base URL</span>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://optinodeiq.com"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 700 }}>Authorization token (HX2_API_KEY)</span>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste 64-char token here"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 700 }}>taskType</span>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
            >
              {tasks.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <div style={{ display: "grid", gap: 6, alignContent: "end" }}>
            <button
              onClick={enqueue}
              disabled={busy}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #111827",
                background: busy ? "#9ca3af" : "#111827",
                color: "white",
                fontWeight: 800,
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              {busy ? "Sending..." : "Enqueue Task"}
            </button>
          </div>
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 700 }}>payload (JSON)</span>
          <textarea
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            rows={10}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #d1d5db", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
          />
        </label>
      </section>

      <h2 style={{ marginTop: 18, fontSize: 20, fontWeight: 800 }}>Recent results</h2>

      <div style={{ display: "grid", gap: 10 }}>
        {log.length === 0 && (
          <div style={{ opacity: 0.7 }}>No runs yet.</div>
        )}
        {log.map((item, idx) => (
          <div key={idx} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
              <div style={{ fontWeight: 900 }}>
                {item.ok ? "✅" : "❌"} {item.taskType}
              </div>
              <div style={{ opacity: 0.75, fontSize: 12 }}>{item.ts}</div>
            </div>
            <pre style={{ marginTop: 10, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, lineHeight: 1.35 }}>
{JSON.stringify(item.res, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, opacity: 0.75, fontSize: 12 }}>
        Tip: For node stubs, try taskType <b>t2.analyze</b> and payload <code>{"{"}"hello":"t2"{"}"}</code>.
      </div>
    </main>
  );
}
