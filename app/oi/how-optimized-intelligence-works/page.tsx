import type { Metadata } from "next";

export const metadata = {
  alternates: { canonical: "/oi/how-optimized-intelligence-works" },
  openGraph: { url: "https://optinodeiq.com/oi/how-optimized-intelligence-works" },
};

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="text-4xl font-black tracking-tight">How Optimized Intelligence Works</h1>
      <p className="mt-4 text-white/75 leading-relaxed">
        Optimized Intelligence (OI) is about getting <span className="font-semibold">repeatable outcomes</span>, not just answers.
        It combines clear inputs, a decision process, verification, and a practical action plan.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold">1) Define the outcome</h2>
          <p className="mt-2 text-sm text-white/70">
            What does “success” look like? What constraints matter (time, money, risk, compliance)?
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold">2) Capture the right inputs</h2>
          <p className="mt-2 text-sm text-white/70">
            Facts, context, and ground-truth signals. No guessing. No “hallucinated” assumptions.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold">3) Run a repeatable decision flow</h2>
          <p className="mt-2 text-sm text-white/70">
            Use a structured playbook: steps, checks, failure modes, and safe defaults.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold">4) Verify + ship</h2>
          <p className="mt-2 text-sm text-white/70">
            Validate the result, document it, and make it reusable as a “node” for next time.
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold">The “OI loop”</h2>
        <ol className="mt-3 list-disc pl-5 text-white/75 leading-relaxed">
          <li>Outcome →</li>
          <li>Inputs →</li>
          <li>Decision flow →</li>
          <li>Verification →</li>
          <li>Action plan →</li>
          <li>Saved as a reusable node</li>
        </ol>
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