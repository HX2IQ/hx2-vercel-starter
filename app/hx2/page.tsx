"use client";

import React, { useMemo, useState } from "react";

type RssMatch = {
  feed_id?: string;
  feed_name?: string;
  title?: string;
  url?: string;
  published_at?: string | null;
  score?: number;
  excerpt?: string | null;
};

export default function HX2ConsolePage() {
  const BaseDefault = "https://patch.optinodeiq.com";

  const [base, setBase] = useState(BaseDefault);
  const [msg, setMsg] = useState("");
  const [useWeb, setUseWeb] = useState(false);
  const [useRss, setUseRss] = useState(false);
  const [blendRssIntoChat, setBlendRssIntoChat] = useState(true);

  const [rankMode, setRankMode] = useState<"recent" | "relevance">("recent");
  const [idsCsv, setIdsCsv] = useState("bbc_top,consortium,grayzone,mintpress");
  const [nItemsPerFeed, setNItemsPerFeed] = useState(25);
  const [maxMatches, setMaxMatches] = useState(20);
  const [timeoutMs, setTimeoutMs] = useState(12000);

  const [busy, setBusy] = useState(false);
  const [chatJson, setChatJson] = useState<any>(null);
  const [rssJson, setRssJson] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const ids = useMemo(() => {
    return idsCsv
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }, [idsCsv]);

  function ts() {
    return Date.now();
  }

  function fmtRssDigest(matches: RssMatch[], limit = 6) {
    const top = (matches || []).slice(0, limit);
    if (!top.length) return "";
    const lines = top.map((m, i) => {
      const t = (m.title || "").replace(/\s+/g, " ").trim();
      const u = (m.url || "").trim();
      const f = (m.feed_id || m.feed_name || "").trim();
      const p = (m.published_at || "").trim();
      return `${i + 1}. [${f}] ${t}${p ? ` (${p})` : ""}\n   ${u}`;
    });
    return `\n\n[RSS DIGEST | rank=${rankMode} | ids=${ids.join(",")}]\n${lines.join("\n")}\n`;
  }

  async function callJson(url: string, body?: any) {
    const res = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: body ? { "content-type": "application/json", "cache-control": "no-cache" } : { "cache-control": "no-cache" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { json = { ok: false, error: "non-json response", text }; }
    return json;
  }

  async function run() {
    setBusy(true);
    setError(null);
    setChatJson(null);
    setRssJson(null);

    try {
      const m0 = (msg || "").trim();
      if (!m0) {
        setError("Message is empty.");
        return;
      }

      let rssMatches: RssMatch[] = [];
      let rssResp: any = null;

      // 1) Optional RSS scan
      if (useRss) {
        const rssUrl = `${base}/api/rss/scan?ts=${ts()}`;
        const rssBody = {
          q: m0,
          ids,
          n_items_per_feed: nItemsPerFeed,
          max_matches: maxMatches,
          timeout_ms: timeoutMs,
          rank_mode: rankMode,
        };
        rssResp = await callJson(rssUrl, rssBody);
        setRssJson(rssResp);
        if (rssResp?.ok && Array.isArray(rssResp?.matches)) {
          rssMatches = rssResp.matches as RssMatch[];
        }
      }

      // 2) Chat
      const chatUrl = `${base}/api/chat/send?ts=${ts()}`;
      let finalMsg = m0;

      // Web trigger (safe + backward compatible)
      if (useWeb) {
        finalMsg = `Use web: ${finalMsg}\nCite sources.`;
      }

      // Optional blend of RSS into chat context (no backend changes needed)
      if (useRss && blendRssIntoChat) {
        finalMsg = `${finalMsg}${fmtRssDigest(rssMatches)}`;
      }

      const chatBody = { message: finalMsg };
      const chatResp = await callJson(chatUrl, chatBody);
      setChatJson(chatResp);

      if (chatResp?.ok === false) {
        setError(chatResp?.error || "chat ok=false");
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ margin: "0 0 8px 0" }}>HX2 Console</h1>
      <div style={{ marginBottom: 12, opacity: 0.8 }}>Control plane (Web + RSS + Blend) — client-side, low-risk.</div>

      <div style={{ display: "grid", gap: 8, maxWidth: 980 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <div>Base URL</div>
          <input value={base} onChange={e => setBase(e.target.value)} style={{ padding: 8 }} />
        </label>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <label><input type="checkbox" checked={useWeb} onChange={e => setUseWeb(e.target.checked)} /> Use Web</label>
          <label><input type="checkbox" checked={useRss} onChange={e => setUseRss(e.target.checked)} /> Use RSS</label>
          <label><input type="checkbox" checked={blendRssIntoChat} onChange={e => setBlendRssIntoChat(e.target.checked)} disabled={!useRss} /> Blend RSS into Chat</label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <label style={{ display: "grid", gap: 4 }}>
            <div>RSS ids (comma-separated)</div>
            <input value={idsCsv} onChange={e => setIdsCsv(e.target.value)} style={{ padding: 8 }} disabled={!useRss} />
          </label>

          <label style={{ display: "grid", gap: 4 }}>
            <div>Rank Mode</div>
            <select value={rankMode} onChange={e => setRankMode(e.target.value as any)} style={{ padding: 8 }} disabled={!useRss}>
              <option value="recent">recent</option>
              <option value="relevance">relevance</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: 4 }}>
            <div>Items per feed</div>
            <input type="number" value={nItemsPerFeed} onChange={e => setNItemsPerFeed(Number(e.target.value || 0))} style={{ padding: 8 }} disabled={!useRss} />
          </label>

          <label style={{ display: "grid", gap: 4 }}>
            <div>Max matches</div>
            <input type="number" value={maxMatches} onChange={e => setMaxMatches(Number(e.target.value || 0))} style={{ padding: 8 }} disabled={!useRss} />
          </label>

          <label style={{ display: "grid", gap: 4 }}>
            <div>Timeout (ms)</div>
            <input type="number" value={timeoutMs} onChange={e => setTimeoutMs(Number(e.target.value || 0))} style={{ padding: 8 }} disabled={!useRss} />
          </label>
        </div>

        <label style={{ display: "grid", gap: 4 }}>
          <div>Message</div>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} style={{ padding: 8 }} />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={run} disabled={busy} style={{ padding: "10px 14px", cursor: busy ? "not-allowed" : "pointer" }}>
            {busy ? "Running..." : "Run"}
          </button>
          {error ? <div style={{ color: "crimson", paddingTop: 10 }}>{error}</div> : null}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <h3>RSS Response</h3>
            <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#eee", padding: 12, borderRadius: 8, minHeight: 240 }}>
              {rssJson ? JSON.stringify(rssJson, null, 2) : "(none)"}
            </pre>
          </div>
          <div>
            <h3>Chat Response</h3>
            <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#eee", padding: 12, borderRadius: 8, minHeight: 240 }}>
              {chatJson ? JSON.stringify(chatJson, null, 2) : "(none)"}
            </pre>
          </div>
        </div>

        <div style={{ marginTop: 10, opacity: 0.8 }}>
          Tip: Try “Who won the Super Bowl last Sunday?” with Web ON. Try “Iran war oil lobby summit” with RSS ON.
        </div>
      </div>
    </div>
  );
}