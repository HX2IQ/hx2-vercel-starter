export const metadata = {
  alternates: { canonical: "/oi/optimized-intelligence-use-cases" },
  openGraph: { url: "https://optinodeiq.com/oi/optimized-intelligence-use-cases" },
};

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="text-4xl font-black tracking-tight">Optimized Intelligence Use Cases</h1>
      <p className="mt-4 text-white/75 leading-relaxed">
        OI is most useful anywhere you care about <span className="font-semibold">repeatability</span>,
        <span className="font-semibold"> verification</span>, and <span className="font-semibold">measurable outcomes</span>.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold">Business operations</h2>
          <p className="mt-2 text-sm text-white/70">
            SOPs, playbooks, customer workflows, pricing logic, fulfillment, support triage.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold">Marketing + SEO</h2>
          <p className="mt-2 text-sm text-white/70">
            Topic clusters, landing pages, content systems, lead capture, conversion improvements.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold">Decision support</h2>
          <p className="mt-2 text-sm text-white/70">
            Vendor selection, due diligence, verification-first research, risk scoring.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold">Protocol building</h2>
          <p className="mt-2 text-sm text-white/70">
            Health routines, compliance checklists, training programs, “what to do next” systems.
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold">Next step</h2>
        <p className="mt-3 text-white/75 leading-relaxed">
          If you want your outcomes to improve over time, convert the workflow into a reusable node.
        </p>
        <p className="mt-4 text-sm text-white/60">
          Start with the definition:{" "}
          <a className="underline underline-offset-4" href="/oi/what-is-optimized-intelligence">
            What is Optimized Intelligence?
          </a>
        </p>
      </div>
    </main>
  );
}