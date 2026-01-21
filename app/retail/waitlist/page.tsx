"use client";

import { useState } from "react";
import Link from "next/link";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ ok?: boolean; msg?: string }>({});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ msg: "Submitting..." });

    const r = await fetch("/api/retail/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const j = await r.json().catch(() => ({}));
    if (r.ok && j?.ok) {
      setStatus({ ok: true, msg: "You’re in. Check your email soon." });
      setEmail("");
      return;
    }
    setStatus({ ok: false, msg: j?.error ? `Error: ${j.error}` : "Error submitting" });
  }

  return (
    <main className="min-h-screen bg-[#070A12] text-white">
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <h1 className="text-3xl font-semibold tracking-tight">Join the Waitlist</h1>
          <p className="mt-2 text-white/70">
            Early access unlocks as nodes and features go live.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan-400/50"
            />

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-cyan-500/20 hover:brightness-110 transition"
            >
              Request Invite
            </button>

            {status.msg && (
              <div className={`text-sm ${status.ok ? "text-emerald-300" : "text-white/70"}`}>
                {status.msg}
              </div>
            )}
          </form>

          <div className="mt-6 flex gap-4 text-sm">
            <Link className="text-white/60 hover:text-white transition" href="/retail">← Back</Link>
            <Link className="text-white/60 hover:text-white transition" href="/retail/progress">Progress Dashboard</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
