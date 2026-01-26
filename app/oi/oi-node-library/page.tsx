import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OI Node Library | Optinode",
  description: "A practical OI node library: what a node is, how nodes are structured, and how reusable nodes compound decision quality over time.",
  alternates: { canonical: "/oi/oi-node-library" },
  openGraph: { url: "https://optinodeiq.com/oi/oi-node-library" },
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
        <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight">OI Node Library</h1>
        <p className="mt-4 text-white/80 leading-relaxed max-w-3xl">A node is a reusable decision module: clear inputs, verification rules, decision steps, and measurable outputs. Libraries of nodes become an operating system.</p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/60">
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Outcome-first</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Verification</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Repeatable playbooks</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Measurable outputs</span>
        </div>
      </div>

        <Section title="What a node contains">
          <ul className="list-disc pl-5 space-y-2">
            <li>Outcome and scope</li>
            <li>Inputs and required sources</li>
            <li>Verification rules</li>
            <li>Decision flow</li>
            <li>Outputs and metrics</li>
          </ul>
        </Section>
        <Section title="Why nodes compound">
          <ul className="list-disc pl-5 space-y-2">
            <li>Less rework</li>
            <li>More consistency</li>
            <li>Faster onboarding</li>
            <li>Better decisions under stress</li>
          </ul>
        </Section>
        <Section title="Starter node categories">
          <ul className="list-disc pl-5 space-y-2">
            <li>Business</li>
            <li>Health</li>
            <li>Markets</li>
            <li>Operations</li>
            <li>Parenting / family systems</li>
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