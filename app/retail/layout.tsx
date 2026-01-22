import "../app/globals.css";
import Link from "next/link";

export const dynamic = "force-dynamic";

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm text-white/70 hover:text-white transition"
    >
      {label}
    </Link>
  );
}

export default function RetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070A12] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/retail" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
              <span className="text-xs font-bold text-white/80">OI</span>
            </div>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">OptinodeIQ</div>
              <div className="text-xs text-white/60">Retail Preview</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink href="/retail/products" label="Products" />
            <NavLink href="/retail/pricing" label="Pricing" />
            <NavLink href="/retail/about" label="About" />
            <NavLink href="/retail/progress" label="Progress" />
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/retail/progress"
              className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition sm:inline-flex"
            >
              Live Status
            </Link>
            <Link
              href="/retail/waitlist"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-cyan-500/20 hover:brightness-110 transition"
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {children}
      </main>

      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} OptinodeIQ</div>
          <div className="flex gap-6">
            <Link className="hover:text-white transition" href="/retail/about">About</Link>
            <Link className="hover:text-white transition" href="/retail/pricing">Pricing</Link>
            <Link className="hover:text-white transition" href="/retail/waitlist">Waitlist</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

