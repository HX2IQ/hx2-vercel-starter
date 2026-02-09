export const dynamic = "force-dynamic";

export default function OwnerConsolePage() {
  return (
    <div style={{ padding: 18, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Owner Console</div>
        <div style={{ fontSize: 12, opacity: 0.7, border: "1px solid #e5e7eb", padding: "2px 8px", borderRadius: 999 }}>
          Phase 1 (static UI)
        </div>
      </div>

      <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 14 }}>
        This page is intentionally <b>static-only</b> to prevent client-side crashes. Next phases will add state, then safe fetch.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Session</div>
          <div style={{ fontFamily: "monospace" }}>owner-console</div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Memory</div>
          <div style={{ fontFamily: "monospace" }}>status: (not wired)</div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Input</div>
          <textarea
            style={{ width: "100%", minHeight: 140, border: "1px solid #eee", borderRadius: 10, padding: 10, fontFamily: "monospace" }}
            defaultValue={'{\n  "command": "SYSTEM_STATUS",\n  "mode": "OWNER",\n  "detail": "SUMMARY"\n}'}
            readOnly
          />
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>Phase 2 will make this editable.</div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Response</div>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#0b1220", color: "#d7e2ff", border: "1px solid #111", padding: 12, borderRadius: 10 }}>
{`Ready.
(Phase 1 static UI – no network calls yet.)`}
          </pre>
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>
        Next: Phase 2 adds hooks (useState/useEffect/useMemo) but still no fetch.
      </div>
    </div>
  );
}