export function H1({ children }: { children: any }) {
  return <h1 className="text-3xl md:text-4xl font-black tracking-tight">{children}</h1>;
}

export function P({ children }: { children: any }) {
  return <p className="text-white/70 leading-relaxed">{children}</p>;
}

export function Section({ children }: { children: any }) {
  return <section className="mt-8">{children}</section>;
}

export function Card({ title, children, right }: { title?: string; children: any; right?: any }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      {(title || right) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          {title ? <div className="text-lg font-extrabold">{title}</div> : <div />}
          {right ? <div className="text-xs text-white/45">{right}</div> : null}
        </div>
      )}
      {children}
    </div>
  );
}

export function Button({ href, children, variant = "primary" }: { href: string; children: any; variant?: "primary" | "ghost" }) {
  const cls =
    variant === "primary"
      ? "inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
      : "inline-flex items-center justify-center rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm font-semibold text-white/85 hover:text-white hover:bg-black/40 transition-colors";

  return (
    <a href={href} className={cls}>
      {children}
    </a>
  );
}

export function Grid2({ children }: { children: any }) {
  return <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

export function Grid3({ children }: { children: any }) {
  return <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>;
}
