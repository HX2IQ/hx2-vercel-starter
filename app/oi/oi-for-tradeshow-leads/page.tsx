import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    alternates: { canonical: "/oi/oi-for-tradeshow-leads" },
  openGraph: { url: "https://optinodeiq.com/oi/oi-for-tradeshow-leads" },
title: "OI Article | Optinode",
  description: "Optimized Intelligence (OI) article.",
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
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white/60">Optinode OI</p>
          <h1 className="text-4xl font-bold tracking-tight">Optimized Intelligence for Trade Show Leads</h1>
          <p className="mt-3 text-white/75 max-w-3xl">How Optimized Intelligence (OI) turns trade show conversations into qualified leads using structured decision criteria.</p>
        </div>
        <Link className="text-sm underline underline-offset-4 text-white/70 hover:text-white" href="/oi">
          Back to OI hub
        </Link>
      </div>

      <Section title="The OI Framework (in plain English)">
        <ul className="list-disc pl-6 space-y-2">
          <li>Outcome: what “better” means in this domain</li>
          <li>Signals: what you measure repeatedly</li>
          <li>Verification: trends instead of one-offs (avoid noise)</li>
          <li>Decision flow: if/then rules that stay consistent</li>
          <li>Actions: small, repeatable moves you can run weekly</li>
          <li>Feedback: measure results, refine, repeat</li>
        </ul>
      </Section>

      <Section title="Common mistakes">
        <ul className="list-disc pl-6 space-y-2">
          <li>Acting on single data points</li>
          <li>Changing 5 variables at once</li>
          <li>No baseline, no trend window</li>
          <li>No “stop rules”</li>
        </ul>
      </Section>

      <Section title="Next steps">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Define your outcome and a 14-day baseline</li>
          <li>Pick 3 signals that actually correlate with the outcome</li>
          <li>Write a simple weekly playbook you can repeat</li>
        </ol>
      </Section>
    </main>
  );
}

