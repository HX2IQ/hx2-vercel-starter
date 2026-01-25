export const dynamic = "force-dynamic";

function Pill({ children }: { children: any }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

function Card({ title, children }: { title: string; children: any }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-lg font-extrabold">{title}</div>
      <div className="mt-2 text-sm text-white/70 leading-relaxed">{children}</div>
    </div>
  );
}

export default function OIAboutPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 md:p-12">
        <div className="flex flex-wrap gap-2">
          <Pill>OptinodeOI</Pill>
          <Pill>Retail nodes</Pill>
          <Pill>Public-safe demo</Pill>
        </div>

        <h1 className="mt-5 text-4xl md:text-5xl font-black tracking-tight">
          What is OI?
        </h1>

        <p className="mt-4 text-base md:text-lg text-white/75 leading-relaxed max-w-3xl">
          OI stands for <b>Optimized Intelligence</b> — practical, purpose-built tools (“nodes”) that help you make better decisions
          faster. Think <b>simple, useful</b>, and <b>action-first</b> — not “AI for AI’s sake.”
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <a
            href="/oi/lead"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
          >
            Request access
          </a>
          <a
            href="/oi/nodes"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-black/30 px-5 py-3 text-sm font-semibold text-white/85 hover:text-white hover:bg-black/40 transition-colors"
          >
            View public nodes
          </a>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Nodes, not noise">
          Each node is a focused tool: one job, clean output, minimal confusion. No endless chat loops.
        </Card>

        <Card title="Retail-first experience">
          OptinodeOI is the public face where retail nodes live: lead capture, comparisons, explainers, and demos.
        </Card>

        <Card title="Private engine, public shell">
          The public site stays clean and safe. The deeper orchestration stays behind controlled access.
        </Card>
      </div>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="text-xl font-extrabold">What you can do today</div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <a className="rounded-2xl border border-white/10 bg-black/30 p-5 hover:bg-black/40 transition-colors" href="/oi/lead">
            <div className="font-bold">Lead capture</div>
            <div className="text-sm text-white/65 mt-1">Request access + routing to the right node.</div>
          </a>
          <a className="rounded-2xl border border-white/10 bg-black/30 p-5 hover:bg-black/40 transition-colors" href="/oi/compare">
            <div className="font-bold">Product compare</div>
            <div className="text-sm text-white/65 mt-1">Public demo comparison output (fast + clear).</div>
          </a>
          <a className="rounded-2xl border border-white/10 bg-black/30 p-5 hover:bg-black/40 transition-colors" href="/oi/waitlist">
            <div className="font-bold">Waitlist</div>
            <div className="text-sm text-white/65 mt-1">Email-only lightweight signup.</div>
          </a>
          <a className="rounded-2xl border border-white/10 bg-black/30 p-5 hover:bg-black/40 transition-colors" href="/oi/nodes">
            <div className="font-bold">Installed nodes</div>
            <div className="text-sm text-white/65 mt-1">See what’s live right now.</div>
          </a>
        </div>
      </div>

      <div className="mt-8 text-xs text-white/45">
        Note: This is a public-safe demo. Production copy + pricing + positioning can be tightened once your retail catalog is locked.
      </div>
    </div>
  );
}
