export const dynamic = "force-dynamic";

function Card({
  title,
  desc,
  href,
  tag,
}: {
  title: string;
  desc: string;
  href: string;
  tag?: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="mt-1 text-sm text-white/70">{desc}</div>
        </div>
        {tag ? (
          <span className="shrink-0 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-xs text-white/70">
            {tag}
          </span>
        ) : null}
      </div>
      <div className="mt-4 text-sm font-semibold text-white/80 group-hover:text-white">
        Open →
      </div>
    </a>
  );
}

export default function OIRetailHub() {
  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs text-white/60">Retail</div>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Retail Hub</h1>
        <p className="mt-2 text-white/70 max-w-2xl">
          This is the public launcher for retail nodes: waitlist, compare, and lead capture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          title="Lead Capture"
          desc="Capture a lead and store it (Redis)."
          href="/oi/lead"
          tag="Next: UI form"
        />
        <Card
          title="Waitlist"
          desc="Email capture endpoint + UI (working)."
          href="/oi/waitlist"
          tag="Live"
        />
        <Card
          title="Product Compare"
          desc="Public comparison demo (working)."
          href="/oi/compare"
          tag="Live"
        />
        <Card
          title="Retail Site"
          desc="Your retail pages (products, pricing, about)."
          href="/retail"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-sm font-semibold">What I recommend next</div>
        <div className="mt-2 text-sm text-white/70">
          Build a premium <b>lead capture UI</b> at <code className="text-white/85">/oi/lead</code> that posts into
          <code className="text-white/85"> /api/retail/lead-capture</code>, with a polished thank-you state and dedupe.
        </div>
      </div>
    </div>
  );
}
