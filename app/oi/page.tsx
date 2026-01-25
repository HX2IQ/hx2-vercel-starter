export const dynamic = "force-dynamic";

function Tile({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <a
      href={href}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
    >
      <div className="text-lg font-extrabold">{title}</div>
      <div className="mt-2 text-sm text-white/65 leading-relaxed">{desc}</div>
      <div className="mt-4 text-xs text-white/45">Open →</div>
    </a>
  );
}

export default function OIHome() {
  return (
    <div>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 md:p-12">
        <div className="text-xs text-white/60">OptinodeOI</div>
        <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight">
          Optimized Intelligence
        </h1>
        <p className="mt-4 max-w-3xl text-base md:text-lg text-white/75 leading-relaxed">
          Retail-ready nodes that deliver clear outputs fast — built to feel premium, simple, and useful.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <a
            href="/oi/about"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-black/30 px-5 py-3 text-sm font-semibold text-white/85 hover:text-white hover:bg-black/40 transition-colors"
          >
            What is OI?
          </a>
          <a
            href="/oi/lead"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
          >
            Request access
          </a>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Tile href="/oi/nodes" title="Nodes" desc="See what’s installed and publicly visible right now." />
        <Tile href="/oi/compare" title="Product Compare" desc="Public demo comparison output (clear, fast, plain English)." />
        <Tile href="/oi/waitlist" title="Waitlist" desc="Lightweight email signup that writes to Redis." />
        <Tile href="/oi/lead" title="Lead Capture" desc="Capture + route requests to the right node." />
        <Tile href="/oi/status" title="Status" desc="System health snapshot: base, worker, queue." />
        <Tile href="/oi/about" title="About OI" desc="A clean explanation of what OI is and why it matters." />
      </div>
    </div>
  );
}
