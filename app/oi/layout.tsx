export const dynamic = "force-dynamic";

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="rounded-xl px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
    >
      {label}
    </a>
  );
}

export default function OILayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* subtle background */}
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-40 left-10 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-24 right-10 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/oi" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl border border-white/15 bg-white/5 grid place-items-center font-black">
              OI
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight">OptinodeOI</div>
              <div className="text-xs text-white/60">Optimized Intelligence • Retail</div>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/oi/about" label="What is OI" />
            <NavLink href="/oi/nodes" label="Nodes" />
            <NavLink href="/oi/compare" label="Compare" />
            <NavLink href="/oi/waitlist" label="Waitlist" />
            <NavLink href="/oi/lead" label="Lead Capture" />
            <NavLink href="/oi/status" label="Status" />
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/oi/lead"
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
            >
              Request access
            </a>
          </div>
        </div>

        {/* mobile nav */}
        <div className="md:hidden border-t border-white/10">
          <div className="mx-auto max-w-6xl px-3 py-2 flex gap-1 overflow-x-auto">
            <NavLink href="/oi/about" label="About" />
            <NavLink href="/oi/nodes" label="Nodes" />
            <NavLink href="/oi/compare" label="Compare" />
            <NavLink href="/oi/waitlist" label="Waitlist" />
            <NavLink href="/oi/lead" label="Lead" />
            <NavLink href="/oi/status" label="Status" />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-5 py-10">
        {children}
      </main>

      <footer className="relative border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-8 text-xs text-white/45 flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} OptinodeOI</div>
          <div className="text-white/35">Public-safe demo • Premium UI shell</div>
        </div>
      </footer>
    </div>
  );
}
