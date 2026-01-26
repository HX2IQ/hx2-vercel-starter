import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Optinode OI Roadmap | Optinode",
  description: "The Optinode OI roadmap: publish core OI definitions, add use-case pages, build node examples, then productize into tools and templates.",
  alternates: { canonical: "/oi/oi-roadmap" },
  openGraph: { url: "https://optinodeiq.com/oi/oi-roadmap" },
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
        <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight">The Optinode OI Roadmap</h1>
        <p className="mt-4 text-white/80 leading-relaxed max-w-3xl">The purpose of the OI site is to define the category, publish a clear framework, and build compounding SEO by shipping high-signal pages that map to real use cases.</p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/60">
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Outcome-first</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Verification</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Repeatable playbooks</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Measurable outputs</span>
        </div>
      </div>

        <Section title="Phase 1: Category definition">
          <ul className="list-disc pl-5 space-y-2">
            <li>Definition pages</li>
            <li>Comparisons (OI vs AI/BI/consulting)</li>
            <li>Use cases</li>
          </ul>
        </Section>
        <Section title="Phase 2: Demonstrate the method">
          <ul className="list-disc pl-5 space-y-2">
            <li>Node examples</li>
            <li>Templates</li>
            <li>Case studies</li>
          </ul>
        </Section>
        <Section title="Phase 3: Productize">
          <ul className="list-disc pl-5 space-y-2">
            <li>Tools</li>
            <li>Playbooks</li>
            <li>Retail onboarding</li>
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