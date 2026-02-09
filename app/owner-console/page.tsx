"use client";

import { useEffect, useMemo, useState } from "react";
type AnyJson = any;

function nowTs() {
return Date.now().toString();
}

export default function OwnerConsolePage() {
  
type MemoryStatus = {
  ok?: boolean;
  session?: string;
  dir?: string;
  has_profile?: boolean;
  has_mem?: boolean;
  mem_lines?: number;
  brain_version?: string;
  mode?: string;
  error?: string;
};

const [memoryStatus, setMemoryStatus] = useState<MemoryStatus>({
  has_mem: false,
  session: "unknown",
  mem_lines: 0,
  dir: ""
});
const [memoryErr, setMemoryErr] = useState<string>("");
// TEMP: stop-the-bleeding placeholder until memory wiring is added
const [ownerKey, setOwnerKey] = useState<string>(() => {
    if (typeof window === "undefined") return "";
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setMemoryErr("");
        const r = await fetch("/api/brain/memory/status", {
          method: "GET",
          headers: { "x-hx2-session": (session || "owner-console-test") }
        });
        const j = await r.json();
        if (!cancelled) {
          if (j?.ok && j?.data) {
            setMemoryStatus(j.data);
          } else {
            setMemoryErr(j?.data?.error || j?.error || "memory status failed");
          }
        }
      } catch (e: any) {
        if (!cancelled) setMemoryErr(e?.message || "memory status error");
      }
    })();
    return () => { cancelled = true; };
  }, [session]);

    return sessionStorage.getItem("OWNER_CONSOLE_KEY") || "";
  });

  const [session, setSession] = useState<string>(() => "owner-console");
  const [input, setInput] = useState<string>(() => "");
  const [lastRequest, setLastRequest] = useState<string>("");
  const [output, setOutput] = useState<string>("Ready.");
  const [busy, setBusy] = useState<boolean>(false);

  const presets = useMemo(() => {
    const mk = (command: string, detail: string = "SUMMARY") =>
      JSON.stringify({ command, mode: "OWNER", detail, ts: nowTs() }, null, 2);

    return [
      { label: "SYSTEM_STATUS", payload: "SYSTEM_STATUS" },
      { label: "Memory Status (proxy)", payload: mk("status.memory", "FULL") },
      { label: "Brain Status", payload: mk("status.brain", "SUMMARY") },
      { label: "QIDC Status", payload: mk("status.qidc", "SUMMARY") },
      { label: "List Nodes", payload: mk("registry.nodes.list", "SUMMARY") },
    ];
  }, []);

  async function send(payload: string) {
setBusy(true);
    setLastRequest(payload);

    try {
      const r = await fetch("/api/owner/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-owner-key": ownerKey || "",
          "x-hx2-session": session || "owner-console",
        },
        body: JSON.stringify({ message: payload }),
      });

      const text = await r.text();
      let data: AnyJson = null;

      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      // Prefer nested upstream reply if available
      const pretty = JSON.stringify(data, null, 2);
      setOutput(pretty);
    } catch (e: any) {
      setOutput(JSON.stringify({ ok: false, error: String(e?.message || e) }, null, 2));
    } finally {
      setBusy(false);
    }
  }

  function saveKey(k: string) {
setOwnerKey(k);
    if (typeof window !== "undefined") sessionStorage.setItem("OWNER_CONSOLE_KEY", k);
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Owner Console (v0.1)</h1>
<div className="flex items-center gap-2 mt-2">
  <div className="text-xs px-2 py-1 rounded border">
    <span className="opacity-70">Memory:</span>{" "}
    <span className="font-semibold">
      {memoryStatus?.has_mem ? "ON" : "OFF"}
    </span>
  </div>
  <div className="text-xs px-2 py-1 rounded border">
    <span className="opacity-70">Session:</span>{" "}
    <span className="font-semibold">
      {memoryStatus?.session ?? "unknown"}
    </span>
  </div>
  <div className="text-xs px-2 py-1 rounded border">
    <span className="opacity-70">Lines:</span>{" "}
    <span className="font-semibold">
      {typeof memoryStatus?.mem_lines === "number" ? memoryStatus.mem_lines : "?"}
    </span>
  </div>
  {memoryErr ? (
    <div className="text-xs px-2 py-1 rounded border">
      <span className="opacity-70">Err:</span>{" "}
      <span className="font-semibold">{memoryErr}</span>
    </div>
  ) : null}
</div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ flex: "1 1 280px" }}>
          <label style={{ display: "block", fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Owner Key</label>
          <input
            value={ownerKey}
            onChange={(e) => saveKey(e.target.value)}
            placeholder="Set OWNER_CONSOLE_KEY (matches Vercel env var)"
            style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          />
        </div>

        <div style={{ flex: "0 0 220px" }}>
          <label style={{ display: "block", fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Session</label>
          <input
            value={session}
            onChange={(e) => setSession(e.target.value)}
            placeholder="x-hx2-session"
            style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {presets.map((p) => (
          <button
            key={p.label}
            disabled={busy}
            onClick={() => send(p.payload)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: busy ? "#f6f6f6" : "white",
              cursor: busy ? "not-allowed" : "pointer",
              fontWeight: 600
            }}
            title="Click to send"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={{ display: "block", fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Custom Payload</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Type anything here (plain text or JSON). Example: {"command":"status.memory","mode":"OWNER"}'
          rows={6}
          style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            disabled={busy || !input.trim()}
            onClick={() => send(input)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #222",
              background: busy ? "#222" : "#111",
              color: "white",
              cursor: busy ? "not-allowed" : "pointer",
              fontWeight: 700
            }}
          >
            {busy ? "Sending..." : "Send"}
          </button>

          <button
            disabled={busy}
            onClick={() => { setInput(""); setOutput("Ready."); setLastRequest(""); }}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
              cursor: busy ? "not-allowed" : "pointer",
              fontWeight: 600
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Last Request</div>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#fafafa", border: "1px solid #eee", padding: 12, borderRadius: 10 }}>
            {lastRequest || "(none)"}
          </pre>
        </div>

        <div>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Response</div>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#0b1220", color: "#d7e2ff", border: "1px solid #111", padding: 12, borderRadius: 10 }}>
            {output}
          </pre>
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.75 }}>
        Tip: If you see 401/403, set the Vercel env var OWNER_CONSOLE_KEY and paste the same key above.
      </div>
    </div>
  );
}