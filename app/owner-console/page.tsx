"use client";

import { useEffect, useMemo, useState } from "react";

type Preset = { name: string; payload: string };

function nowTs() {
  return Date.now();
}

export default function OwnerConsolePage() {
  // Phase 2: hooks are live, but we DO NOT call fetch() yet.
  const [session, setSession] = useState<string>("owner-console-test");
  const [ownerKey, setOwnerKey] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try { return sessionStorage.getItem("OWNER_CONSOLE_KEY") || ""; } catch { return ""; }
  });

  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("Ready.");
  const [busy, setBusy] = useState<boolean>(false);
  // Crash capture (client-side) — keeps the page usable even if something throws later
  const [crash, setCrash] = useState<string>("");

  useEffect(() => {
    const onError = (e: ErrorEvent) => setCrash(String(e?.message || "Unknown error"));
    const onRejection = (e: PromiseRejectionEvent) => setCrash(String((e as any)?.reason?.message || (e as any)?.reason || "Unhandled rejection"));
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (ownerKey) sessionStorage.setItem("OWNER_CONSOLE_KEY", ownerKey);
    } catch {}
  }, [ownerKey]);

  const presets: Preset[] = useMemo(() => {
    const mk = (name: string, command: string) => ({
      name,
      payload: JSON.stringify({ command, mode: "OWNER", detail: "SUMMARY", ts: nowTs() }, null, 2)
    });
    return [
      mk("SYSTEM_STATUS", "SYSTEM_STATUS"),
      mk("PING", "PING"),
      mk("NEXT_UPGRADES", "NEXT_UPGRADES"),
    ];
  }, []);

  const runLocal = (payload: string) => {
    // Phase 2: local echo only (no network).
    setBusy(true);
    setTimeout(() => {
      setOutput(
        "PHASE2_LOCAL_ONLY\n\n" +
        "This console is in Phase 2 (hooks live, no fetch).\n\n" +
        "Session: " + session + "\n" +
        "OwnerKey: " + (ownerKey ? "[set]" : "[empty]") + "\n\n" );
      setBusy(false);
    }, 150);
  };

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Owner Console</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Phase 2: hooks-only (no network)</div>
      </div>

      {crash ? (
        <div style={{ padding: 12, border: "1px solid #f00", borderRadius: 10, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Client Crash Captured</div>
          <div style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{crash}</div>
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Session</div>
          <input
            value={session}
            onChange={(e) => setSession(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </div>

        <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Owner Key (stored in sessionStorage)</div>
          <input
            value={ownerKey}
            onChange={(e) => setOwnerKey(e.target.value)}
            placeholder="Paste OWNER_CONSOLE_KEY here"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {presets.map((p) => (
          <button
            key={p.name}
            onClick={() => { setInput(p.payload); runLocal(p.payload); }}
            disabled={busy}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer" }}
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={() => { setInput(""); setOutput("Ready."); setCrash(""); }}
          disabled={busy}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer" }}
        >
          Clear
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Request Payload (Phase 2 = local echo)</div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
          />
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button
              onClick={() => runLocal(input || "{}")}
              disabled={busy}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer" }}
            >
              {busy ? "Running..." : "Run (Local)"}
            </button>
          </div>
        </div>

        <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Response</div>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#0b1220", color: "#d7e2ff", border: "1px solid #111", padding: 12, borderRadius: 10 }}>
            {output}
          </pre>
        </div>
</div>
    </div>
  );
}