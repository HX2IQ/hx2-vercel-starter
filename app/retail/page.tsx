"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import NeuroNet from "./_components/NeuroNet";

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="text-sm text-white/80 hover:text-white transition" href={href}>
      {label}
    </Link>
  );
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-cyan-500/20 hover:brightness-110 transition"
    >
      {children}
    </Link>
  );
}

function GhostButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/10 transition"
    >
      {children}
    </Link>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur">
      <div className="text-base font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-white/70">{desc}</div>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.06 * i, duration: 0.5 } }),
};

export default function RetailHome() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero background */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {/* NeuroNet disabled for crash isolation */}
          <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/30 via-cyan-500/20 to-emerald-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Nav */}
        <header className="relative z-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
            <Link href="/retail" className="flex items-center gap-3">
              <Image src="/brand/optinodeiq-logo.svg" alt="OptinodeIQ" width={200} height={52} priority />
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <NavLink href="/retail/products" label="Products" />
              <NavLink href="/retail/pricing" label="Pricing" />
              <NavLink href="/retail/about" label="About" />
              <NavLink href="/retail/progress" label="Progress" />
            </nav>

            <div className="flex items-center gap-3">
              <GhostButton href="/retail/progress">Live Status</GhostButton>
              <PrimaryButton href="/retail/waitlist">Join Waitlist</PrimaryButton>
            </div>
          </div>
        </header>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-10 md:pt-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <motion.div initial="hidden" animate="show" variants={fadeUp} custom={1}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Production online • Retail live • Wiring in real-time
              </motion.div>

              <motion.h1 initial="hidden" animate="show" variants={fadeUp} custom={2}
                className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl"
              >
                The premium customer layer for HX2 —
                <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent"> built to ship fast</span>.
              </motion.h1>

              <motion.p initial="hidden" animate="show" variants={fadeUp} custom={3}
                className="mt-4 max-w-xl text-base leading-relaxed text-white/75"
              >
                A real website customers can trust on day one — with a live progress dashboard, waitlist capture,
                and capabilities wired in as nodes come online.
              </motion.p>

              <motion.div initial="hidden" animate="show" variants={fadeUp} custom={4}
                className="mt-7 flex flex-wrap gap-3"
              >
                <PrimaryButton href="/retail/products">Explore Products</PrimaryButton>
                <GhostButton href="/retail/pricing">See Pricing</GhostButton>
                <GhostButton href="/retail/progress">Progress Dashboard</GhostButton>
              </motion.div>

              <motion.div initial="hidden" animate="show" variants={fadeUp} custom={5}
                className="mt-8 grid gap-3 sm:grid-cols-2"
              >
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold text-white/70">Retail</div>
                  <div className="mt-1 text-sm text-white">Home / Products / Pricing / About / Waitlist</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold text-white/70">Nodes</div>
                  <div className="mt-1 text-sm text-white">Scaffold → Register → Ping → Describe</div>
                </div>
              </motion.div>
            </div>

            {/* Right panel */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/40 backdrop-blur md:p-8"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Live Progress</div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
                  Online
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-semibold text-white/70">What’s wired</div>
                  <div className="mt-1 text-sm text-white">Waitlist capture • Progress checks • Live routes</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-semibold text-white/70">Next</div>
                  <div className="mt-1 text-sm text-white">Product cards + pricing tiers + invite flow</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <GhostButton href="/retail/progress">View Status</GhostButton>
                <PrimaryButton href="/retail/waitlist">Request Invite</PrimaryButton>
              </div>

              <div className="mt-6 text-xs text-white/60">
                Public-safe: Retail stays stable while backend features roll out behind it.
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Premium-first UX" desc="Looks legit now: color, depth, motion, and structure—customers won’t bounce." />
          <Card title="Progress dashboard" desc="A live “is it working?” page so you can verify wiring without guessing." />
          <Card title="Waitlist that saves" desc="Emails stored in Redis immediately—no fake forms, no dead buttons." />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-white/60">© {new Date().getFullYear()} OptinodeIQ</div>
          <div className="flex gap-6 text-sm">
            <Link className="text-white/60 hover:text-white transition" href="/retail/about">About</Link>
            <Link className="text-white/60 hover:text-white transition" href="/retail/pricing">Pricing</Link>
            <Link className="text-white/60 hover:text-white transition" href="/retail/waitlist">Waitlist</Link>
            <Link className="text-white/60 hover:text-white transition" href="/retail/progress">Progress</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}


