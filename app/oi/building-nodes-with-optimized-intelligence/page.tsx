import type { Metadata } from "next";

export const metadata = {
  alternates: { canonical: "/oi/building-nodes-with-optimized-intelligence" },
  openGraph: { url: "https://optinodeiq.com/oi/building-nodes-with-optimized-intelligence" },
};

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="text-4xl font-black tracking-tight">Building Nodes with Optimized Intelligence</h1>
      <p className="mt-4 text-white/75 leading-relaxed">
        In Optinode, a <span className="font-semibold">node</span> is a reusable intelligence unit.
        It captures a proven workflow—so you can run it again with new inputs and get consistent outcomes.
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold">What a “node” includes</h2>
        <ul className="mt-3 list-disc pl-5 text-white/70 leading-relaxed">
          <li><span className="font-semibold">Purpose:</span> the outcome the node exists to deliver</li>
          <li><span className="font-semibold">Inputs:</span> what it needs (photos, text, data, constraints)</li>
          <li><span className="font-semibold">Process:</span> the decision flow / checklist / playbook</li>
          <li><span className="font-semibold">Verification:</span> how it checks it’s not wrong</li>
          <li><span className="font-semibold">Outputs:</span> the deliverable (steps, plan, draft, report)</li>
        </ul>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-lg font-bold">Example node: “Launch Page SEO”</h2>
          <p className="mt-2 text-sm text-white/70">
            Inputs: topic + target keyword → Process: page structure + internal links + metadata → Output: publish-ready pages.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-lg font-bold">Example node: “Trade show lead capture”</h2>
          <p className="mt-2 text-sm text-white/70">
            Inputs: booth photo + context → Process: classify + verify + value → Output: actionable lead profile.
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold">Why this beats “chatting”</h2>
        <p className="mt-3 text-white/75 leading-relaxed">
          Nodes reduce randomness. They make results repeatable, auditable, and improvable over time.
          That is the core of Optimized Intelligence.
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