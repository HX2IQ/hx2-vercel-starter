"use client";

import React, { useMemo, useState } from "react";

type RssMatch = {
  feed_id?: string;
  feed_name?: string;
  title?: string;
  url?: string;
  published_at?: string | null;
  published_ms?: number | null;
  score?: number | null;
  excerpt?: string | null;
};

export default function HX2ConsolePage() {
  const BaseDefault = "https://patch.optinodeiq.com";

  const [base, setBase] = useState(BaseDefault);
  const [msg, setMsg] = useState("");

  const [useWeb, setUseWeb] = useState(false);
  const [useRss, setUseRss] = useState(true);

  const [rankMode, setRankMode] = useState<"recent" | "relevance">("recent");
  const [idsCsv, setIdsCsv] = useState("bbc_top,consortium,grayzone,mintpress");
  const [nItemsPerFeed, setNItemsPerFeed] = useState(25);
  const [maxMatches, setMaxMatches] = useState(20);
  const [timeoutMs, setTimeoutMs] = useState(12000);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rssJson, setRssJson] = useState<any>(null);
  const [chatJson, setChatJson] = useState<any>(null);
  const [finalMessageSent, setFinalMessageSent] = useState<string>("");

  const ids = useMemo(() => {
    return idsCsv
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }, [idsCsv]);

  function ts() { return Date.now(); }

  async function callJson(url: string, body?: any) {
    const res = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: body
        ? { "content-type": "application/json", "cache-control": "no-cache" }
        : { "cache-control": "no-cache" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { json = { ok: false, error: "non-json response", text }; }
    return json;
  }

  // IMPORTANT: "best match" should NOT be matches[0].
  // We pick highest score; tie-break by recency when rankMode=recent.
  function getBestMatch(rssResp: any): RssMatch | null {
    if (!rssResp?.ok || !Array.isArray(rssResp?.matches) || rssResp.matches.length < 1) return null;

    const list = rssResp.matches as RssMatch[];

    let best: RssMatch | null = null;
    for (const m of list) {
      const s = Number(m.score ?? 0);
      const p = Number(m.published_ms ?? 0);

      if (!best) { best = m; continue; }

      const bs = Number(best.score ?? 0);
      const bp = Number(best.published_ms ?? 0);

      if (s > bs) { best = m; continue; }

      if (s === bs && rankMode === "recent") {
        if (p > bp) { best = m; continue; }
      }
    }
    return best;
  }

  async function run() {
    setBusy(true);
    setError(null);
    setRssJson(null);
    setChatJson(null);
    setFinalMessageSent("");

    try {
      const m0 = (msg || "").trim();
      if (!m0) {
        setError("Message is empty.");
        return;
      }

      let rssResp: any = null;
      let best: RssMatch | null = null;

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
        best = getBestMatch(rssResp);
      }

      // Build high-signal chat message from BEST RSS match
      let finalMsg = m0;

      if (best?.url) {
        finalMsg =
          `Analyze this specific article and summarize key claims + implications:\n` +
          `${best.title ? `Title: ${best.title}\n` : ""}` +
          `URL: ${best.url}\n` +
          `${best.published_at ? `Published: ${best.published_at}\n` : ""}` +
          `${(best.score ?? null) !== null ? `Score: ${best.score}\n` : ""}` +
          `\nReturn: (1) 5-bullet summary (2) bias/angle assessment (3) 3 follow-up verification questions.`;
      }

      // Keep web explicit (backend trigger). But if web returns 0, it should not fabricate.
      if (useWeb) {
        finalMsg = `Use web: ${finalMsg}\nOnly cite from provided sources[]. If sources[] is empty, say web returned 0 results.`;
      }

      setFinalMessageSent(finalMsg);

      const chatUrl = `${base}/api/chat/send?ts=${ts()}`;
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

  function promoteBestRssToMessage() {
    const best = getBestMatch(rssJson);
    if (best?.title) setMsg(best.title);
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ margin: "0 0 8px 0" }}>HX2 Console</h1>
      <div style={{ marginBottom: 12, opacity: 0.8 }}>
        Operator console: RSS scan + promote BEST match (score-first) into chat (high-signal).
      </div>

      <div style={{ display: "grid", gap: 8, maxWidth: 1050 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <div>Base URL</div>
          <input value={base} onChange={e => setBase(e.target.value)} style={{ padding: 8 }} />
        </label>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <label><input type="checkbox" checked={useWeb} onChange={e => setUseWeb(e.target.checked)} /> Use Web (explicit prefix)</label>
          <label><input type="checkbox" checked={useRss} onChange={e => setUseRss(e.target.checked)} /> Use RSS</label>
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
          <div>Message (query seed)</div>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} style={{ padding: 8 }} />
        </label>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={run} disabled={busy} style={{ padding: "10px 14px", cursor: busy ? "not-allowed" : "pointer" }}>
            {busy ? "Running..." : "Run"}
          </button>
          <button onClick={promoteBestRssToMessage} disabled={!rssJson?.ok} style={{ padding: "10px 14px" }}>
            Promote BEST RSS Title → Message
          </button>
          {error ? <div style={{ color: "crimson" }}>{error}</div> : null}
        </div>

        <div>
          <h3>Final message actually sent to chat</h3>
          <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#eee", padding: 12, borderRadius: 8 }}>
            {finalMessageSent ? finalMessageSent : "(none yet)"}
          </pre>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <h3>RSS Response</h3>
            <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#eee", padding: 12, borderRadius: 8, minHeight: 260 }}>
              {rssJson ? JSON.stringify(rssJson, null, 2) : "(none)"}
            </pre>
          </div>
          <div>
            <h3>Chat Response</h3>
            <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#eee", padding: 12, borderRadius: 8, minHeight: 260 }}>
              {chatJson ? JSON.stringify(chatJson, null, 2) : "(none)"}
            </pre>
          </div>
        </div>

        <div style={{ marginTop: 8, opacity: 0.8 }}>
          With your query “Iran war oil lobby summit”, BEST match should select Grayzone (score=9) and feed that URL into chat.
        </div>
      </div>
    </div>
  );
}