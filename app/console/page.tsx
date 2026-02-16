"use client";

import { useMemo, useState } from "react";

type Source = { url?: string; title?: string };
type ChatResp = any;

export default function ConsolePage() {
  const [msg, setMsg] = useState("");
  const [useWeb, setUseWeb] = useState(false);
  const [useRss, setUseRss] = useState(false);
  const [rankMode, setRankMode] = useState<"recent" | "relevance">("recent");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<ChatResp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const endpoint = useMemo(() => (useRss ? "/api/rss/scan" : "/api/chat/send"), [useRss]);

  async function run() {
    setErr(null);
    setResp(null);

    const m = msg.trim();
    if (!m) return;

    setLoading(true);
    try {
      if (useRss) {
        // RSS scan directly (no “rss:” prefix dependency)
        const body = {
          q: m,
          ids: ["bbc_top", "consortium", "grayzone", "mintpress"],
          n_items_per_feed: 25,
          max_matches: 20,
          timeout_ms: 12000,
          rank_mode: rankMode,
        };
        const r = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json", "cache-control": "no-cache" },
          body: JSON.stringify(body),
        });
        const json = await r.json();
        setResp(json);
      } else {
        // Chat send; keep it simple: use prefix to trigger web
        const sendMsg = useWeb ? `Use web: ${m} Cite sources.` : m;
        const r = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json", "cache-control": "no-cache" },
          body: JSON.stringify({ message: sendMsg }),
        });
        const json = await r.json();
        setResp(json);
      }
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const sources: Source[] =
    (resp?.sources as Source[]) ||
    (resp?.data?.sources as Source[]) ||
    [];

  return (
    <main style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>HX2 Console</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Chat + Web + RSS from one screen (no PowerShell patch loops).
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", margin: "14px 0" }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={useWeb} onChange={(e) => setUseWeb(e.target.checked)} disabled={useRss} />
          Use Web
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={useRss} onChange={(e) => setUseRss(e.target.checked)} />
          Use RSS
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          Rank
          <select value={rankMode} onChange={(e) => setRankMode(e.target.value as any)} disabled={!useRss}>
            <option value="recent">recent</option>
            <option value="relevance">relevance</option>
          </select>
        </label>
      </div>

      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Type your question…"
        rows={4}
        style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button
          onClick={run}
          disabled={loading}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "white" }}
        >
          {loading ? "Running…" : "Run"}
        </button>

        <button
          onClick={() => { setMsg(""); setResp(null); setErr(null); }}
          disabled={loading}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "white" }}
        >
          Clear
        </button>
      </div>

      {err && (
        <pre style={{ marginTop: 16, padding: 12, background: "#fff3f3", border: "1px solid #ffd1d1", borderRadius: 10 }}>
          {err}
        </pre>
      )}

      {resp && (
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <section style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Reply</div>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
              {resp?.reply ?? resp?.data?.reply ?? "(no reply field returned)"}
            </pre>
          </section>

          <section style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Sources ({sources.length})</div>
            {sources.length ? (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {sources.slice(0, 10).map((s, i) => (
                  <li key={i}>
                    <a href={s.url || "#"} target="_blank" rel="noreferrer">{s.title || s.url}</a>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ opacity: 0.7 }}>(none)</div>
            )}
          </section>

          <section style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Raw JSON</div>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
              {JSON.stringify(resp, null, 2)}
            </pre>
          </section>
        </div>
      )}
    </main>
  );
}