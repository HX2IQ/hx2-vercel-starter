"use client";

import React, { useMemo, useState } from "react";

type WebFetchResult =
  | {
      ok: true;
      session?: string;
      source_url: string;
      host: string;
      fetched_at: string;
      status: number;
      content_type: string;
      bytes: number;
      truncated_bytes: boolean;
      ms: number;
      text: string;
    }
  | {
      ok: false;
      session?: string;
      source_url?: string;
      host?: string;
      error: string;
      ms?: number;
      allowlist?: string[];
    };

function getSessionId(): string {
  const key = "hx2_session_id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const sid = "owner-ui-" + Math.random().toString(16).slice(2);
  sessionStorage.setItem(key, sid);
  return sid;
}

export default function WebFetchPanel() {
  const [url, setUrl] = useState("https://developer.mozilla.org/en-US/docs/Web/API/fetch");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<WebFetchResult | null>(null);
  const [session, setSession] = useState<string>("");

  const sessionId = useMemo(() => {
    try {
      const sid = getSessionId();
      setSession(sid);
      return sid;
    } catch {
      return "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run() {
    const u = url.trim();
    if (!u) return;

    setBusy(true);
    setRes(null);

    try {
      const r = await fetch(`/api/web/fetch?ts=${Date.now()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionId ? { "x-hx2-session": sessionId } : {}),
        },
        body: JSON.stringify({ url: u }),
        cache: "no-store",
      });

      const j = (await r.json().catch(() => ({ ok: false, error: "bad json" }))) as WebFetchResult;
      setRes(j);
    } catch (e: any) {
      setRes({ ok: false, error: String(e?.message || e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">WebFetch (Read-only)</div>
          <div className="text-xs text-neutral-600">
            Manual fetch • allowlisted hosts • no auto-memory write • session: <span className="font-mono">{session || "—"}</span>
          </div>
        </div>

        <button
          onClick={run}
          disabled={busy}
          className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
        >
          {busy ? "Fetching…" : "Fetch"}
        </button>
      </div>

      <div className="mt-3">
        <label className="text-xs font-medium text-neutral-700">URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
        />
      </div>

      {res && (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg bg-neutral-50 p-3 text-xs">
            <div className="font-semibold">{res.ok ? "OK" : "FAIL"}</div>
            <div className="mt-1 font-mono whitespace-pre-wrap break-words">
              {res.ok ? (
                <>
                  <div>source_url: {res.source_url}</div>
                  <div>host: {res.host}</div>
                  <div>status: {res.status}</div>
                  <div>content_type: {res.content_type || "—"}</div>
                  <div>bytes: {res.bytes} truncated_bytes: {String(res.truncated_bytes)}</div>
                  <div>fetched_at: {res.fetched_at} ms: {res.ms}</div>
                </>
              ) : (
                <>
                  <div>error: {res.error}</div>
                  {res.allowlist?.length ? (
                    <div className="mt-2">
                      allowlist:
                      <div className="mt-1 font-mono">{res.allowlist.join(", ")}</div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-neutral-700">Text (sanitized)</div>
            <pre className="mt-1 max-h-[320px] overflow-auto rounded-lg border bg-white p-3 text-xs leading-5 whitespace-pre-wrap">
              {res.ok ? res.text : ""}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
}