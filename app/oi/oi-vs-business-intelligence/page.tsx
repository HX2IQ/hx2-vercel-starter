import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OI vs Business Intelligence (BI) | Optinode",
  description: "OI vs BI: dashboards show what happened; OI turns signals into decisions and actions with verification, constraints, and outcomes.",
  alternates: { canonical: "/oi/oi-vs-business-intelligence" },
  openGraph: { url: "https://optinodeiq.com/oi/oi-vs-business-intelligence" },
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
        <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight">OI vs Business Intelligence (BI)</h1>
        <p className="mt-4 text-white/80 leading-relaxed max-w-3xl">BI is visibility. OI is an operating framework. BI tells you what happened; OI tells you what to do next—and why.</p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/60">
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Outcome-first</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Verification</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Repeatable playbooks</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Measurable outputs</span>
        </div>
      </div>

        <Section title="BI strengths">
          <ul className="list-disc pl-5 space-y-2">
            <li>Reporting and dashboards</li>
            <li>Historical analysis</li>
            <li>Visibility across teams</li>
          </ul>
        </Section>
        <Section title="Where BI stops">
          <ul className="list-disc pl-5 space-y-2">
            <li>No decision rules</li>
            <li>No verification gates</li>
            <li>No playbooks</li>
            <li>No feedback loop</li>
          </ul>
        </Section>
        <Section title="How OI complements BI">
          <ul className="list-disc pl-5 space-y-2">
            <li>Turns BI metrics into action thresholds</li>
            <li>Adds verification and exception handling</li>
            <li>Creates reusable decision playbooks</li>
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