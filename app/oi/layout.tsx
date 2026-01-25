import type { ReactNode } from "react";

export const metadata = {
  title: "OptinodeOI",
  description: "Optimized Intelligence",
};

function Nav() {
  const links = [
    { href: "/oi", label: "Overview" },
    { href: "/oi/about", label: "What is OI" },
    { href: "/oi/nodes", label: "Nodes" },
    { href: "/oi/compare", label: "Compare" },
    { href: "/oi/waitlist", label: "Waitlist" },
  ];

  return (
    <div className="sticky top-0 z-20 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between gap-6">
        <a href="/oi" className="font-extrabold tracking-tight text-white">
          Optinode<span className="text-white/60">OI</span>
        </a>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-white/70 hover:text-white transition-colors px-3 py-1 rounded-xl hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OILayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        {children}
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 pt-6 text-xs text-white/40">
        © {new Date().getFullYear()} OptinodeOI • Retail-safe public demo
      </footer>
    </div>
  );
}
