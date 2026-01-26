import type { Metadata } from "next";

export const metadata = {
  alternates: { canonical: "/oi/what-is-optimized-intelligence" },
  openGraph: { url: "https://optinodeiq.com/oi/what-is-optimized-intelligence" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-white/80 leading-relaxed">{children}</div>
    </section>
  );
}

export default function WhatIsOptimizedIntelligencePage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-14 md:py-16">
      <p className="text-sm text-white/60">Optinode OI</p>

      <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight">
        What is Optimized Intelligence (OI)?
      </h1>

      <p className="mt-5 text-base md:text-lg text-white/80 leading-relaxed">
        <strong>Optimized Intelligence (OI)</strong> is the disciplined practice of turning information into
        <strong> clear decisions</strong> — with <strong>less noise</strong>, <strong>less confusion</strong>,
        and <strong>more measurable outcomes</strong>.
      </p>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/70">Simple definition</p>
        <p className="mt-2 text-white/85 leading-relaxed">
          OI is an operating system for thinking: it filters inputs, organizes what matters, tests assumptions,
          and produces action steps you can trust.
        </p>
      </div>

      <Section title="The problem OI solves">
        <p>
          Most people don’t suffer from a lack of information — they suffer from <strong>too much</strong>.
          The result is overload, reactive decisions, and wasted time.
        </p>
        <p>
          OI is built to solve: <strong>signal vs. noise</strong>, <strong>decision paralysis</strong>,
          and <strong>inconsistent execution</strong>.
        </p>
      </Section>

      <Section title="Core principles of Optimized Intelligence">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Clarity first:</strong> define the decision before collecting more data.</li>
          <li><strong>Evidence + context:</strong> facts matter, but so does relevance and timing.</li>
          <li><strong>Bias awareness:</strong> identify emotional triggers and narrative pull.</li>
          <li><strong>Systems thinking:</strong> connect dots across domains without overfitting.</li>
          <li><strong>Action outputs:</strong> every insight must produce a next step.</li>
          <li><strong>Feedback loops:</strong> measure results and adjust.</li>
        </ul>
      </Section>

      <Section title="What OI looks like in real life">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Business:</strong> faster decisions on marketing, pricing, hiring, and ops.</li>
          <li><strong>Personal:</strong> health and lifestyle choices with less trial-and-error.</li>
          <li><strong>Research:</strong> organize messy information into a usable map.</li>
          <li><strong>Markets:</strong> avoid hype cycles; act on signals that actually matter.</li>
        </ul>
      </Section>

      <Section title="OI vs AI">
        <p>
          AI can generate content. OI focuses on <strong>decision quality</strong> and <strong>execution</strong>.
          In practice, OI may use AI tools — but it refuses to outsource judgment.
        </p>
        <p className="text-white/70">
          We’ll publish a full comparison page soon.
        </p>
      </Section>

      <div className="mt-12 flex flex-wrap gap-3">
        <a className="inline-flex rounded-full bg-white px-5 py-2 font-semibold text-black hover:opacity-90" href="/oi">
          Back to OI
        </a>
        <a className="inline-flex rounded-full border border-white/15 bg-black/30 px-5 py-2 font-semibold text-white hover:bg-black/40" href="/oi/waitlist">
          Join the waitlist
        </a>
        <a className="inline-flex rounded-full border border-white/15 bg-black/30 px-5 py-2 font-semibold text-white hover:bg-black/40" href="/oi/nodes">
          Explore nodes
        </a>
      </div>
    </main>
  );
}