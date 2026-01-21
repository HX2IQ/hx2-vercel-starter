"use client";

import React, { useMemo, useState } from "react";

type RunState = "IDLE" | "ENQUEUED" | "RUNNING" | "DONE" | "ERROR" | "NOOP";

type RunRecord = {
  id: string;              // taskId after enqueue; temp UI id before that
  taskType: string;
  payload: any;
  createdAt: string;
  state: RunState;
  enqueueResponse?: any;
  statusResponse?: any;
  result?: any;
  error?: string | null;
  verify?: {
    endpoint?: string | null;
    before?: any;
    after?: any;
    applied?: boolean | null;
    note?: string;
  };
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function httpJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text().catch(() => "");
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { ok: false, error: "bad_json", raw: text.slice(0, 500) };
  }
  return { ok: res.ok, status: res.status, json };
}

function badge(state: RunState) {
  if (state === "ENQUEUED") return "🟡 ENQUEUED";
  if (state === "RUNNING") return "🔵 RUNNING";
  if (state === "DONE") return "🟢 DONE";
  if (state === "NOOP") return "⚪ NO-OP";
  if (state === "ERROR") return "🔴 ERROR";
  return "⚪ IDLE";
}

function verifyEndpoint(taskType: string, payload: any) {
  // Proof sources (add more as you expand console)
  if (taskType === "demo-node-01.ping") return "/api/nodes/demo-node-01/ping";

  // If/when you implement /api/nodes/[nodeId]/describe, you can verify via registry
  if (taskType === "node.describe") {
    const nodeId = payload?.nodeId || payload?.id;
    if (!nodeId) return null;
    return `/api/registry/node/get?id=${encodeURIComponent(nodeId)}`;
  }

  return null;
}

export default function ConsolePage() {
  const presets = useMemo(() => {
    return [
      {
        taskType: "ping",
        label: "Ping AP2 Worker",
        payload: {},
        verify: null,
      },
      {
        taskType: "demo-node-01.ping",
        label: "Ping Demo Node 01 (HTTP Proof)",
        payload: {},
        verify: "/api/nodes/demo-node-01/ping",
      },
      {
        taskType: "registry.node.list",
        label: "Registry List (direct HTTP)",
        payload: {},
        verify: "/api/registry/node/list",
      },
      {
        taskType: "node.describe",
        label: "Describe Node (requires AP2 taskType + route)",
        payload: { nodeId: "demo-node-01" },
        verify: "/api/registry/node/get?id=demo-node-01",
      },
    ];
  }, []);

  const [taskType, setTaskType] = useState(presets[0].taskType);
  const [payloadText, setPayloadText] = useState(JSON.stringify(presets[0].payload, null, 2));
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [busy, setBusy] = useState(false);

  function loadPreset(t: string) {
    const p = presets.find((x) => x.taskType === t);
    if (!p) return;
    setTaskType(p.taskType);
    setPayloadText(JSON.stringify(p.payload ?? {}, null, 2));
  }

  async function runTask() {
    let payload: any = {};
    try {
      payload = payloadText?.trim() ? JSON.parse(payloadText) : {};
    } catch (e: any) {
      const rec: RunRecord = {
        id: `ui_${Date.now()}`,
        taskType,
        payload: payloadText,
        createdAt: new Date().toISOString(),
        state: "ERROR",
        error: "Payload JSON invalid",
        result: { detail: String(e?.message || e) },
      };
      setRuns((prev) => [rec, ...prev]);
      return;
    }

    setBusy(true);

    const uiId = `ui_${Date.now()}`;
    const createdAt = new Date().toISOString();

    const proofUrl = verifyEndpoint(taskType, payload);

    // add initial record
    setRuns((prev) => [
      {
        id: uiId,
        taskType,
        payload,
        createdAt,
        state: "ENQUEUED",
        verify: proofUrl ? { endpoint: proofUrl } : { endpoint: null, note: "No verification configured (completion != change)" },
      },
      ...prev,
    ]);

    // BEFORE proof snapshot
    let before: any = null;
    if (proofUrl) {
      const beforeRes = await httpJson(proofUrl, { method: "GET" });
      before = beforeRes.json;
      setRuns((prev) =>
        prev.map((r) => (r.id === uiId ? { ...r, verify: { ...(r.verify || {}), endpoint: proofUrl, before } } : r))
      );
    }

    // ENQUEUE
    const enqueueRes = await httpJson("/api/ap2/task/enqueue", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ taskType, mode: "SAFE", payload }),
    });

    if (!enqueueRes.ok) {
      setRuns((prev) =>
        prev.map((r) =>
          r.id === uiId
            ? { ...r, state: "ERROR", enqueueResponse: enqueueRes.json, error: enqueueRes.json?.error || "enqueue_failed" }
            : r
        )
      );
      setBusy(false);
      return;
    }

    const realTaskId = enqueueRes.json?.task?.id || enqueueRes.json?.taskId;
    if (!realTaskId) {
      setRuns((prev) =>
        prev.map((r) => (r.id === uiId ? { ...r, state: "ERROR", enqueueResponse: enqueueRes.json, error: "missing_task_id" } : r))
      );
      setBusy(false);
      return;
    }

    // update record with real taskId
    setRuns((prev) =>
      prev.map((r) =>
        r.id === uiId
          ? { ...r, id: realTaskId, state: "RUNNING", enqueueResponse: enqueueRes.json }
          : r
      )
    );

    // POLL STATUS
    const deadline = Date.now() + 30000;
    let statusJson: any = null;

    while (Date.now() < deadline) {
      const st = await httpJson(`/api/ap2/task/status?taskId=${encodeURIComponent(realTaskId)}`, { method: "GET" });
      statusJson = st.json;
      const s = String(statusJson?.state || "").toUpperCase();

      setRuns((prev) =>
        prev.map((r) => (r.id === realTaskId ? { ...r, statusResponse: statusJson } : r))
      );

      if (s === "DONE" || s === "COMPLETED") {
        setRuns((prev) =>
          prev.map((r) =>
            r.id === realTaskId
              ? { ...r, state: "DONE", result: statusJson?.result, error: null }
              : r
          )
        );
        break;
      }

      if (s === "ERROR" || s === "FAILED") {
        setRuns((prev) =>
          prev.map((r) =>
            r.id === realTaskId
              ? { ...r, state: "ERROR", error: statusJson?.error || "task_failed", result: null }
              : r
          )
        );
        setBusy(false);
        return;
      }

      await sleep(1200);
    }

    // AFTER proof snapshot
    if (proofUrl) {
      const afterRes = await httpJson(proofUrl, { method: "GET" });
      const after = afterRes.json;

      const beforeUpdated = before?.node?.updatedAt || before?.updatedAt;
      const afterUpdated = after?.node?.updatedAt || after?.updatedAt;

      const applied =
        typeof beforeUpdated === "string" && typeof afterUpdated === "string"
          ? beforeUpdated !== afterUpdated
          : null;

      setRuns((prev) =>
        prev.map((r) =>
          r.id === realTaskId
            ? {
                ...r,
                verify: {
                  endpoint: proofUrl,
                  before,
                  after,
                  applied,
                  note:
                    applied === true
                      ? "Verified change (updatedAt changed)"
                      : applied === false
                      ? "Verified NO-OP (updatedAt same)"
                      : "Verified response (no diff rule)",
                },
                state: applied === false ? "NOOP" : r.state,
              }
            : r
        )
      );
    }

    setBusy(false);
  }

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, Segoe UI, Arial" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>HX2 Console</h1>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Commands</div>
          <select
            value={taskType}
            onChange={(e) => {
              const v = e.target.value;
              setTaskType(v);
              loadPreset(v);
            }}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          >
            {presets.map((p) => (
              <option key={p.taskType} value={p.taskType}>
                {p.label}
              </option>
            ))}
          </select>

          <div style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
            <div><b>TaskType:</b> {taskType}</div>
            <div><b>Verification:</b> {verifyEndpoint(taskType, (() => { try { return JSON.parse(payloadText||"{}"); } catch { return {}; } })()) || "None"}</div>
          </div>

          <button
            onClick={runTask}
            disabled={busy}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #333",
              background: busy ? "#eee" : "#111",
              color: busy ? "#333" : "#fff",
              cursor: busy ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            {busy ? "Running..." : "Run"}
          </button>

          <div style={{ marginTop: 12, fontSize: 12, color: "#555" }}>
            ✅ <b>DONE</b> means task completed.<br />
            🧾 <b>Proof panel</b> tells you if it actually changed anything.
          </div>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Payload (JSON)</div>
          <textarea
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            spellCheck={false}
            style={{
              width: "100%",
              minHeight: 210,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #ccc",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: 12,
              lineHeight: 1.4,
            }}
          />
        </div>
      </div>

      <h2 style={{ marginTop: 18, fontSize: 16, fontWeight: 800 }}>Recent results</h2>

      <div style={{ display: "grid", gap: 12 }}>
        {runs.map((r) => (
          <div key={r.id} style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800 }}>{badge(r.state)} <span style={{ color: "#666", fontWeight: 600 }}>— {r.taskType}</span></div>
                <div style={{ fontSize: 12, color: "#666" }}>taskId: {r.id}</div>
                <div style={{ fontSize: 12, color: "#666" }}>created: {r.createdAt}</div>
              </div>
              {r.error ? <div style={{ color: "#b00020", fontWeight: 800 }}>{r.error}</div> : null}
            </div>

            <details style={{ marginTop: 10 }}>
              <summary style={{ cursor: "pointer", fontWeight: 700 }}>Show details</summary>
              <pre style={{ marginTop: 10, padding: 12, borderRadius: 12, background: "#f7f7f7", overflowX: "auto", fontSize: 12 }}>
{JSON.stringify({
  payload: r.payload,
  enqueueResponse: r.enqueueResponse,
  statusResponse: r.statusResponse,
  result: r.result,
}, null, 2)}
              </pre>
            </details>

            <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: "#fafafa", border: "1px solid #eee" }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Proof / Verification</div>
              <div style={{ fontSize: 12, color: "#555" }}>
                <div><b>Endpoint:</b> {r.verify?.endpoint || "None"}</div>
                <div><b>Note:</b> {r.verify?.note || (r.verify?.endpoint ? "Snapshot taken" : "No verification configured (completion != change)")}</div>
                {typeof r.verify?.applied === "boolean" ? (
                  <div><b>Applied:</b> {r.verify?.applied ? "YES (changed)" : "NO (no-op)"} </div>
                ) : null}
              </div>

              {r.verify?.before || r.verify?.after ? (
                <details style={{ marginTop: 8 }}>
                  <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Show before/after</summary>
                  <pre style={{ marginTop: 8, padding: 10, borderRadius: 12, background: "#f7f7f7", overflowX: "auto", fontSize: 12 }}>
{JSON.stringify({ before: r.verify?.before, after: r.verify?.after }, null, 2)}
                  </pre>
                </details>
              ) : null}
            </div>
          </div>
        ))}
        {runs.length === 0 ? <div style={{ color: "#666" }}>No runs yet.</div> : null}
      </div>
    </div>
  );
}