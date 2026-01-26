import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OI for Ecommerce | Optinode",
  description: "Optimized Intelligence (OI) for ecommerce: product pages, funnels, retention, ad spend, and customer support—decisions driven by verified signals.",
  alternates: { canonical: "/oi/oi-for-ecommerce" },
  openGraph: { url: "https://optinodeiq.com/oi/oi-for-ecommerce" },
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
        <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight">OI for Ecommerce</h1>
        <p className="mt-4 text-white/80 leading-relaxed max-w-3xl">Ecommerce is a game of compounding: better decisions on product, traffic, conversion, and retention stack over time. OI makes those decisions systematic.</p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/60">
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Outcome-first</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Verification</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Repeatable playbooks</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">Measurable outputs</span>
        </div>
      </div>

        <Section title="The OI approach">
          <ul className="list-disc pl-5 space-y-2">
            <li>Outcome-first (LTV, CAC, conversion, margin)</li>
            <li>Signals (analytics, reviews, support tickets)</li>
            <li>Verification (cohorts, A/B tests)</li>
            <li>Action plans (changes you can ship this week)</li>
          </ul>
        </Section>
        <Section title="High-ROI OI use cases">
          <ul className="list-disc pl-5 space-y-2">
            <li>Product description & FAQ nodes</li>
            <li>Offer and pricing nodes</li>
            <li>Retention and email nodes</li>
            <li>Support triage nodes</li>
          </ul>
        </Section>
        <Section title="What you get">
          <ul className="list-disc pl-5 space-y-2">
            <li>Clear weekly priorities</li>
            <li>Measurable lifts</li>
            <li>Less churn from ‘random changes’</li>
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