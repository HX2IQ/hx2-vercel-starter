import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OI vs Consulting | Optinode",
  description: "OI vs consulting: consulting delivers recommendations; OI delivers a repeatable operating system you can run weekly and improve over time.",
  alternates: { canonical: "/oi/oi-vs-consulting" },
  openGraph: { url: "https://optinodeiq.com/oi/oi-vs-consulting" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-white/80 leading-relaxed">{children}</div>
    </section>
  );
}

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 md:py-16">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-7 md:p-10 shadow-xl shadow-black/40">
        <p className="text-sm text-white/60">Optinode OI</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight">OI vs Consulting</h1>
        <p className="mt-4 text-white/80 leading-relaxed max-w-3xl">Consulting often ends with a slide deck. OI ends with a system: inputs, rules, actions, and feedback loops that continue working after the call.</p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/60">
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Outcome-first</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Verification</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Repeatable playbooks</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Measurable outputs</span>
        </div>
      </div>

        <Section title="What consulting does well">
          <ul className="list-disc pl-5 space-y-2">
            <li>Expert insight</li>
            <li>Strategy refresh</li>
            <li>Gap identification</li>
          </ul>
        </Section>
        <Section title="Where it breaks">
          <ul className="list-disc pl-5 space-y-2">
            <li>Execution drift</li>
            <li>No operating cadence</li>
            <li>No measurable gates</li>
            <li>Knowledge stays in people’s heads</li>
          </ul>
        </Section>
        <Section title="OI approach">
          <ul className="list-disc pl-5 space-y-2">
            <li>Encode decisions as nodes</li>
            <li>Run weekly</li>
            <li>Measure outcomes</li>
            <li>Iterate with proof</li>
          </ul>
        </Section>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-xl font-bold tracking-tight">Related OI pages</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            <li><a className="underline underline-offset-4" href="/oi/what-is-optimized-intelligence">What is Optimized Intelligence?</a></li>
            <li><a className="underline underline-offset-4" href="/oi/how-optimized-intelligence-works">How OI Works</a></li>
            <li><a className="underline underline-offset-4" href="/oi/building-nodes-with-optimized-intelligence">Building Nodes with OI</a></li>
            <li><a className="underline underline-offset-4" href="/oi/optimized-intelligence-vs-ai">OI vs AI</a></li>
          </ul>
          <div className="mt-5">
            <a className="inline-flex font-semibold underline underline-offset-4" href="/oi">Back to OI</a>
          </div>
        </div>
    </main>
  );
}