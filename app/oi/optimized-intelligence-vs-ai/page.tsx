import type { Metadata } from "next";

export const metadata = {
  alternates: { canonical: "/oi/optimized-intelligence-vs-ai" },
  openGraph: { url: "https://optinodeiq.com/oi/optimized-intelligence-vs-ai" },
};

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="text-4xl font-black tracking-tight">Optimized Intelligence vs AI</h1>
      <p className="mt-4 text-white/75 leading-relaxed">
        AI is a tool. OI is a system. OI uses AI when it helps, but the point is reliability:
        verified inputs, repeatable workflows, and outcomes you can track.
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 overflow-hidden">
        <div className="grid sm:grid-cols-2">
          <div className="bg-white/5 p-6">
            <h2 className="text-lg font-bold">AI (tool)</h2>
            <ul className="mt-3 list-disc pl-5 text-white/70 leading-relaxed">
              <li>Generates answers, drafts, ideas</li>
              <li>Can be fast and helpful</li>
              <li>Can be wrong without warning</li>
              <li>Often lacks verification by default</li>
            </ul>
          </div>
          <div className="bg-black/30 p-6">
            <h2 className="text-lg font-bold">OI (framework)</h2>
            <ul className="mt-3 list-disc pl-5 text-white/70 leading-relaxed">
              <li>Starts with a defined outcome</li>
              <li>Uses verified inputs and constraints</li>
              <li>Runs a repeatable playbook</li>
              <li>Includes QA, safety checks, and documentation</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold">Why it matters</h2>
        <p className="mt-3 text-white/75 leading-relaxed">
          If you care about repeatable results—business ops, health protocols, legal workflows, product execution—
          you need more than “an answer.” You need a system that can be audited and improved.
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