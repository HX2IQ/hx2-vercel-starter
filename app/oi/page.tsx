export const dynamic = "force-dynamic";

function Tile({
  title,
  desc,
  href,
  badge,
}: {
  title: string;
  desc: string;
  href: string;
  badge?: string;
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
        {badge ? (
          <span className="shrink-0 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-xs text-white/70">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-4 text-sm font-semibold text-white/80 group-hover:text-white">
        Open →
      </div>
    </a>
  );
}

export default function OIHome() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-7 md:p-10">
        <div className="max-w-2xl">
          <div className="text-xs text-white/60">OptinodeOI</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight">
            Retail nodes that feel premium.
          </h1>
          <p className="mt-3 text-sm md:text-base text-white/70">
            This is the public-facing OI experience. Clean pages, fast demos, and
            lead capture that converts.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/oi/retail"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
            >
              Open Retail Hub
            </a>
            <a
              href="/oi/waitlist"
              className="rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-sm font-semibold text-white/85 hover:text-white hover:bg-black/40 transition-colors"
            >
              Join Waitlist
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-bold">Public demos</h2>
          <div className="text-xs text-white/60">All public-safe routes</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Tile
            title="Retail Hub"
            desc="Launcher for lead capture + demos."
            href="/oi/retail"
            badge="Primary"
          />
          <Tile
            title="Product Compare"
            desc="Plain-English product comparison demo."
            href="/oi/compare"
            badge="Live"
          />
          <Tile
            title="Public Nodes"
            desc="See currently installed public nodes."
            href="/oi/nodes"
          />
          <Tile
            title="Waitlist"
            desc="Email capture that writes to Redis."
            href="/oi/waitlist"
            badge="Live"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-sm font-semibold">Next premium upgrades</div>
        <ul className="mt-3 space-y-2 text-sm text-white/70 list-disc pl-5">
          <li>Retail lead capture UI (conversion-first form + thank-you state)</li>
          <li>Product compare UI polish (filters + “best for” tags)</li>
          <li>Public nodes page polish (badges, grouping, links)</li>
        </ul>
      </section>
    </div>
  );
}
