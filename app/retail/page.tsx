import Link from "next/link";

function Logo() {
  // Inline SVG logo placeholder (clean + premium). Replace later with your real logo asset.
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-black to-zinc-700 shadow-sm ring-1 ring-black/10 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 16.8c2.2-2.5 4.4-3.7 6.6-3.7 2.2 0 4.4 1.2 6.6 3.7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M7 8.2c1.8 1.8 3.6 2.7 5.4 2.7 1.8 0 3.6-.9 5.4-2.7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.85"/>
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight text-zinc-900">OptinodeIQ</div>
        <div className="text-xs text-zinc-500">Optimized Intelligence</div>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
      {children}
    </span>
  );
}

function FeatureCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="text-base font-semibold text-zinc-900">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-zinc-600">{desc}</div>
    </div>
  );
}

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
    >
      {children}
    </Link>
  );
}

export default function RetailHome() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            <Link className="text-sm text-zinc-700 hover:text-zinc-900" href="/retail/products">Products</Link>
            <Link className="text-sm text-zinc-700 hover:text-zinc-900" href="/retail/pricing">Pricing</Link>
            <Link className="text-sm text-zinc-700 hover:text-zinc-900" href="/retail/about">About</Link>
            <Link className="text-sm text-zinc-700 hover:text-zinc-900" href="/retail/waitlist">Waitlist</Link>
          </nav>
          <div className="flex items-center gap-3">
            <SecondaryButton href="/retail/pricing">See Pricing</SecondaryButton>
            <PrimaryButton href="/retail/waitlist">Join Waitlist</PrimaryButton>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-12 md:pt-16">
        <div className="flex flex-col gap-10 md:grid md:grid-cols-2 md:items-center">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge>Retail Site: Live</Badge>
              <Badge>Console: Locked + Operational</Badge>
              <Badge>Nodes: Install → Ping → Describe</Badge>
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
              A premium intelligence platform—
              <span className="text-zinc-500"> built to ship fast</span>.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600">
              OptinodeIQ is the customer-facing layer of HX2. Live retail UX now, wired endpoints now,
              and capabilities turned on as we go—without breaking the site.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <PrimaryButton href="/retail/products">Explore Products</PrimaryButton>
              <SecondaryButton href="/retail/about">What is OptinodeIQ?</SecondaryButton>
              <SecondaryButton href="/retail/waitlist">Get Early Access</SecondaryButton>
            </div>

            <div className="mt-6 flex flex-col gap-2 text-sm text-zinc-600">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span>Production routes responding 200</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span>AP2 enqueue + callbacks working</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span>Node registry records visible via /describe</span>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-900">Live Progress</div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                Online
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-xs font-semibold text-zinc-700">Retail</div>
                <div className="mt-1 text-sm text-zinc-900">Home / Products / Pricing / About / Waitlist</div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-xs font-semibold text-zinc-700">Node Lifecycle</div>
                <div className="mt-1 text-sm text-zinc-900">Scaffold → Register → Ping → Describe</div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-xs font-semibold text-zinc-700">Next Up</div>
                <div className="mt-1 text-sm text-zinc-900">Retail dashboard + waitlist wiring + product cards</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <SecondaryButton href="/retail/pricing">Plans</SecondaryButton>
              <PrimaryButton href="/retail/waitlist">Request Invite</PrimaryButton>
            </div>

            <div className="mt-6 text-xs text-zinc-500">
              This page is safe to ship publicly now. Features wire in behind stable routes.
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            title="Retail-first UX"
            desc="Clean customer pages now. No broken builds while you wire in core functionality."
          />
          <FeatureCard
            title="Node-aware architecture"
            desc="A consistent pattern: endpoints + registry + AP2 worker tasks—scales cleanly."
          />
          <FeatureCard
            title="Ship safely"
            desc="Public site stays stable. Console and admin stay locked, auditable, and controlled."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-900 px-6 py-10 text-white shadow-sm md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-2xl font-semibold tracking-tight">Want early access?</div>
              <div className="mt-2 text-sm text-white/80">
                Join the waitlist and we’ll unlock features as they go live.
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/retail/waitlist"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-100"
              >
                Join Waitlist
              </Link>
              <Link
                href="/retail/products"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-white/10"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-zinc-600">© {new Date().getFullYear()} OptinodeIQ</div>
          <div className="flex gap-6 text-sm">
            <Link className="text-zinc-600 hover:text-zinc-900" href="/retail/about">About</Link>
            <Link className="text-zinc-600 hover:text-zinc-900" href="/retail/pricing">Pricing</Link>
            <Link className="text-zinc-600 hover:text-zinc-900" href="/retail/waitlist">Waitlist</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
