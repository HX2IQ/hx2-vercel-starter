"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Check = { id: string; label: string; ok: boolean; detail?: any };
type Status = { ok: boolean; ts: string; base: string; checks: Check[] };

function Pill({ ok }: { ok: boolean }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
      ok
        ? "bg-emerald-400/15 text-emerald-300 ring-emerald-400/20"
        : "bg-rose-400/15 text-rose-300 ring-rose-400/20"
    }`}>
      {ok ? "PASS" : "FAIL"}
    </span>
  );
}

export default function ProgressPage() {
  const [data, setData] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/retail/status", { cache: "no-store" });
    const j = await r.json().catch(() => null);
    setData(j);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="min-h-screen bg-[#070A12] text-white">
      <div className="mx-auto max-w-4xl px-4 py-14">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Retail Progress Dashboard</h1>
          <button
            onClick={load}
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Refresh
          </button>
        </div>

        <div className="mt-3 text-sm text-white/60">
          Auto-refresh every 7 seconds • {data?.ts ? `Last: ${data.ts}` : ""}
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          {loading && <div className="text-white/70">Loading…</div>}

          {!loading && data?.checks?.length ? (
            <div className="grid gap-3">
              {data.checks.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div>
                    <div className="text-sm font-semibold">{c.label}</div>
                    <div className="mt-1 text-xs text-white/60">
                      {c.detail ? JSON.stringify(c.detail) : ""}
                    </div>
                  </div>
                  <Pill ok={!!c.ok} />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link className="text-white/60 hover:text-white transition" href="/retail">← Back</Link>
          <Link className="text-white/60 hover:text-white transition" href="/retail/waitlist">Waitlist</Link>
          <Link className="text-white/60 hover:text-white transition" href="/retail/products">Products</Link>
        </div>
      </div>
    </main>
  );
}
