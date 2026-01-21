"use client";

import { useMemo, useState } from "react";

function Pretty({ value }: { value: any }) {
  const text = useMemo(() => {
    try { return JSON.stringify(value, null, 2); } catch { return String(value); }
  }, [value]);
  return (
    <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", padding: 12, borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)" }}>
      {text}
    </pre>
  );
}

export default function NodesConsolePage() {
  const [nodeId, setNodeId] = useState("demo-node-01");
  const [customPath, setCustomPath] = useState(`/api/nodes/demo-node-01/describe`);
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<any>(null);

  async function run(path: string) {
    setBusy(true);
    setOut(null);
    try {
      const r = await fetch("/api/console/nodes/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
        cache: "no-store",
      });
      const j = await r.json().catch(() => ({}));
      setOut({ httpStatus: r.status, ...j });
    } catch (e: any) {
      setOut({ ok: false, error: e?.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  const pingPath = `/api/nodes/${nodeId}/ping`;
  const describePath = `/api/nodes/${nodeId}/describe`;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>HX2 Console — Nodes</h1>
      <div style={{ opacity: 0.75, marginBottom: 16 }}>One-click actions that call AP2 via the console adapter.</div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.75 }}>nodeId</span>
          <input
            value={nodeId}
            onChange={(e) => {
              const v = e.target.value;
              setNodeId(v);
              setCustomPath(`/api/nodes/${v}/describe`);
            }}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)", minWidth: 260 }}
            placeholder="demo-node-01"
          />
        </label>

        <button disabled={busy} onClick={() => run(pingPath)} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.2)" }}>
          {busy ? "Running..." : "Ping"}
        </button>

        <button disabled={busy} onClick={() => run(describePath)} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.2)" }}>
          {busy ? "Running..." : "Describe"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 380 }}>
          <span style={{ fontSize: 12, opacity: 0.75 }}>Custom GET path</span>
          <input
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
            placeholder="/api/nodes/demo-node-01/describe"
          />
        </label>
        <button disabled={busy} onClick={() => run(customPath)} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.2)" }}>
          {busy ? "Running..." : "Run GET"}
        </button>
      </div>

      <div style={{ marginTop: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Result</h2>
        <Pretty value={out ?? { ok: true, hint: "Click Ping or Describe to test." }} />
      </div>
    </div>
  );
}
