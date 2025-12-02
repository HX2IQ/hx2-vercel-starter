


"use client";

import React from "react";
import Link from "next/link";
import Brand from "@/components/Brand";



export default function MobileHX2Home() {
  const nodes = [
    { key: "H2", title: "H2", subtitle: "Geopolitics / Control", score: 72, badge: "Alert", color: "from-cyan-400/30 to-blue-500/20" },
    { key: "X2", title: "X2", subtitle: "Crypto / Markets", score: 78, badge: "Buy", color: "from-emerald-400/30 to-teal-500/20" },
    { key: "AH2", title: "AH2", subtitle: "Health / Longevity", score: 92, badge: "Optimal", color: "from-amber-300/30 to-orange-500/20" },
    { key: "K2", title: "K2", subtitle: "Marketing / Growth", score: 66, badge: "Watch", color: "from-fuchsia-400/30 to-purple-500/20" },
    { key: "L2", title: "L2", subtitle: "Legal / IP", score: 54, badge: "Due", color: "from-rose-400/30 to-red-500/20" },
    { key: "W2", title: "W2", subtitle: "Metaphysical / Symbolic", score: 69, badge: "Spike", color: "from-sky-400/30 to-indigo-500/20" },
  ];

  const feed = [
    { tag: "Catalyst", text: "Ripple Prime onboarding tier-1 fund — liquidity corridor opens.", conf: 0.82 },
    { tag: "Narrative", text: "Tokenized oil & gas fund expands on Hedera; RWA volume rising.", conf: 0.76 },
    { tag: "Timing", text: "Mars in Scorpio window → higher volatility cluster (W2 overlay).", conf: 0.64 },
    { tag: "Liquidity", text: "ADA governance cycle sets up institutional entry points.", conf: 0.58 },
  ];

  const insights = [
    { title: "How HX2 called the bank stress cycle", text: "Confluence: H2+X2+W2 flagged 10 days early." },
    { title: "Detective Mode", text: "Hidden-link discovery across filings, flows & narratives." },
    { title: "12-Domain Coverage", text: "From geopolitics to health, with explainable scores." },
  ];

  return (
    <>
      <header className="px-4 pt-5 pb-3 flex items-center justify-between">
      <Brand size={36} withWordmark />  {/* bigger logo */}
      
      <button className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 active:scale-95 transition flex items-center justify-center">
        <span className="sr-only">Open Menu</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-90">
          <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </header>


      {/* ✅ Your existing mobile UI code below */}
      <div className="min-h-screen w-full bg-[#0a0a12] text-white font-sans pb-20">
        {/* Top Gradient + Neural Net feel */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[36rem] rounded-full bg-gradient-to-b from-cyan-400/20 to-blue-600/10 blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 400 800" aria-hidden>
            {Array.from({ length: 28 }).map((_, i) => (
              <path key={i} d={`M ${i * 15} 0 Q ${200 + (i % 2 ? 40 : -40)} 400 ${i * 15} 800`} fill="none" stroke="url(#g)" strokeWidth="0.6" />
            ))}
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
          </svg>
        </div>

      

        {/* Hero */}
        <section className="px-4">
          <h1 className="text-[1.55rem] leading-tight font-semibold">
            Quantum Intelligence for a Chaotic World
          </h1>
          <p className="text-white/70 mt-2 text-sm">
            Layered foresight across markets, geopolitics, health and narrative — with explainable scores.
          </p>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 h-10 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold">
              Access Dashboard
            </button>
            <button className="flex-1 h-10 rounded-2xl border border-white/15 bg-white/5">
              Explore Nodes
            </button>
          </div>
          {/* Confluence Index pill */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            Confluence Index: <b className="ml-1">7.8</b>
          </div>
        </section>

        {/* Node Tiles */}
        <section className="mt-6">
          <div className="px-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-white/80">Active Nodes</h2>
            <button className="text-xs text-white/60 underline">Manage</button>
          </div>
          <div className="mt-3 overflow-x-auto no-scrollbar pl-4 pr-2">
            <div className="flex gap-3 w-max">
              {nodes.map((n) => (
                <div key={n.key} className={`min-w-[180px] rounded-2xl border border-white/10 bg-gradient-to-br ${n.color} p-3 relative`}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{n.title}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/15">{n.badge}</span>
                  </div>
                  <div className="text-[11px] text-white/70 mt-0.5">{n.subtitle}</div>
                  <div className="mt-3 flex items-end gap-2">
                    <div className="text-3xl font-bold">{n.score}</div>
                    <div className="text-xs text-white/60 mb-1">/100</div>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                    <div className="h-1.5 rounded-full bg-cyan-400" style={{ width: `${n.score}%`}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Confluence Feed */}
        <section className="mt-6 px-4">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-white/80">Live Confluence Feed</h2>
          <div className="mt-2 grid gap-3">
            {feed.map((f, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15">{f.tag}</span>
                  <span className="text-white/60">Conf: {(f.conf*100).toFixed(0)}%</span>
                </div>
                <p className="mt-2 text-sm leading-snug text-white/90">{f.text}</p>
                <button className="mt-3 h-9 w-full rounded-xl border border-white/10 bg-white/5 text-xs">View Full Report</button>
              </div>
            ))}
          </div>
        </section>

        {/* Insights */}
        <section className="mt-6 px-4">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-white/80">Insights</h2>
          <div className="mt-2 grid gap-3">
            {insights.map((s, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-3">
                <div className="text-[13px] font-semibold">{s.title}</div>
                <p className="text-white/70 text-sm mt-1">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 inset-x-0 z-10 bg-black/60 backdrop-blur border-t border-white/10">
          <div className="grid grid-cols-4 text-center text-[11px] text-white/70">
            {['Home','Nodes','Reports','Account'].map((t, i) => (
              <button key={i} className="py-3 flex flex-col items-center gap-1 active:opacity-80">
                <span className="h-4 w-4 rounded-sm border border-white/20" />
                {t}
              </button>
            ))}
          </div>
        </nav>

      </div>
    </>
  );
}

