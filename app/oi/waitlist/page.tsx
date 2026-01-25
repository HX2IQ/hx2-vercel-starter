"use client";

import { useState } from "react";
import { H1, P, Card } from "../_ui/ui";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setMsg(null);
    setBusy(true);
    try {
      const r = await fetch("/api/retail/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      setMsg(`Added: ${data.email}`);
      setEmail("");
    } catch (e: any) {
      setMsg(`Error: ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <H1>Join the Waitlist</H1>
      <P>Get notified when new retail nodes go live.</P>

      <div className="mt-6 max-w-xl">
        <Card title="Email">
          <div className="flex gap-2 flex-wrap">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 min-w-[240px] rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-sm outline-none focus:border-white/30"
            />
            <button
              onClick={submit}
              disabled={busy}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
            >
              {busy ? "Saving..." : "Join"}
            </button>
          </div>
          {msg ? <div className="mt-3 text-sm text-white/70">{msg}</div> : null}
        </Card>
      </div>
    </div>
  );
}
