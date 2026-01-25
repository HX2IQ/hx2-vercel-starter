export const dynamic = "force-dynamic";

const LinkA = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    className="text-sm text-white/80 hover:text-white transition-colors"
  >
    {label}
  </a>
);

export default function OILayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Subtle background */}
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-200px] right-[-120px] h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-5 py-3 flex items-center justify-between">
          <a href="/oi" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black font-black">
              OI
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">OptinodeOI</div>
              <div className="text-xs text-white/60">Retail Intelligence</div>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-5">
            <LinkA href="/oi/retail" label="Retail Hub" />
            <LinkA href="/oi/compare" label="Compare" />
            <LinkA href="/oi/nodes" label="Nodes" />
            <LinkA href="/oi/waitlist" label="Waitlist" />
            <LinkA href="/oi/status" label="Status" />
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/oi/retail"
              className="inline-flex items-center rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
            >
              Open Retail
            </a>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-5 py-10">
        {children}
      </main>

      <footer className="relative border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-8 text-xs text-white/60 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} OptinodeOI. All rights reserved.</div>
          <div className="flex gap-4">
            <a className="hover:text-white" href="/oi/status">System Status</a>
            <a className="hover:text-white" href="/oi/waitlist">Waitlist</a>
            <a className="hover:text-white" href="/oi/nodes">Public Nodes</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
