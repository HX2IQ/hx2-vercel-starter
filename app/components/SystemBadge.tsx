"use client";

import { useEffect, useMemo, useState } from "react";

type HealthData = {
  ok?: boolean;
  upstream_status?: number;
  data?: any;
};

function getSessionId(): string {
  // Keep it simple: a stable per-tab session id.
  // If you already have a session system, swap this later.
  const key = "hx2_session_id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;

  const sid = "owner-ui-" + Math.random().toString(16).slice(2);
  sessionStorage.setItem(key, sid);
  return sid;
}

export default function SystemBadge() {
  const [sessionId, setSessionId] = useState<string>("");

  const [health, setHealth] = useState<HealthData | null>(null);
  const [status, setStatus] = useState<HealthData | null>(null);
  const [tail, setTail] = useState<HealthData | null>(null);

  const [canary, setCanary] = useState<string>("");

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  const headers = useMemo(() => {
  const h: Record<string, string> = {};
  if (sessionId) h["x-hx2-session"] = sessionId;
  return h;
}, [sessionId]);

  async function fetchJson(url: string) {
    const r = await fetch(url, { method: "GET", headers, cache: "no-store" });
    const c = r.headers.get("x-chat-route-version") || "";
    if (c) setCanary(c);

    let data: any = {};
    try { data = await r.json(); } catch { data = { ok: false, error: "bad json" }; }
    return { ok: r.ok, upstream_status: r.status, data };
  }

  async function refresh() {
    try {
      const ts = Date.now();

      const [h, s, t] = await Promise.all([
        fetchJson(`/api/brain/health?ts=${ts}`),
        fetchJson(`/api/brain/status?ts=${ts}`),
        fetchJson(`/api/brain/memory/tail?n=10&ts=${ts}`),
      ]);

      setHealth(h);
      setStatus(s);
      setTail(t);
    } catch (e: any) {
      setHealth({ ok: false, data: { error: String(e?.message || e) } });
    }
  }

  useEffect(() => {
    if (!sessionId) return;
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const mem = health?.data?.data || {};
  const brain = status?.data?.data || {};
  const tailN = tail?.data?.data?.n ?? tail?.data?.data?.lines?.length ?? null;

  const okHealth = !!health?.data?.ok;
  const okStatus = !!status?.data?.ok;

  const badge = (ok: boolean | null) => ok === null ? "…" : ok ? "OK" : "FAIL";

  return (
    <div className="fixed top-3 right-3 z-50 rounded-xl border bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
      <div className="text-xs font-semibold">System</div>
      <div className="mt-1 space-y-1 text-[11px] leading-4">
        <div>Brain: <span className="font-mono">{badge(okStatus)}</span></div>
        <div>Memory: <span className="font-mono">{badge(okHealth)}</span></div>
        <div>Lines: <span className="font-mono">{String(mem.lines ?? "—")}</span> Tail: <span className="font-mono">{String(tailN ?? "—")}</span></div>
        <div>NL: <span className="font-mono">{String(mem.endsWithNL ?? "—")}</span> LastOK: <span className="font-mono">{String(mem.lastLineParseOk ?? "—")}</span></div>
        <div>Canary: <span className="font-mono">{canary || "—"}</span></div>
        <div>Session: <span className="font-mono">{sessionId || "—"}</span></div>
      </div>
    </div>
  );
}