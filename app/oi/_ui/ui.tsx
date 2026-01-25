import Link from "next/link";

export const dynamic = "force-dynamic";

export const ContainerStyle: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: 24,
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
};

export function TopNav() {
  const items = [
    { href: "/oi", label: "Home" },
    { href: "/oi/about", label: "About" },
    { href: "/oi/products", label: "Products" },
    { href: "/oi/pricing", label: "Pricing" },
    { href: "/oi/compare", label: "Compare" },
    { href: "/oi/nodes", label: "Nodes" },
    { href: "/oi/status", label: "Status" },
    { href: "/oi/waitlist", label: "Waitlist" },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 0" }}>
      <Link href="/oi" style={{ textDecoration: "none", color: "white", fontWeight: 950, letterSpacing: -0.2 }}>
        Optinode OI
      </Link>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            style={{
              textDecoration: "none",
              color: "rgba(255,255,255,.82)",
              fontSize: 13,
              padding: "6px 10px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.08)",
              background: "rgba(255,255,255,.02)",
            }}
          >
            {i.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Pill({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 12,
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(255,255,255,.04)",
        color: "rgba(255,255,255,.88)",
      }}
    >
      {text}
    </span>
  );
}

export function H1({ children }: { children: any }) {
  return (
    <h1 style={{ fontSize: 42, margin: "8px 0 10px", fontWeight: 1000, letterSpacing: -0.7 }}>
      {children}
    </h1>
  );
}

export function P({ children }: { children: any }) {
  return <p style={{ margin: 0, opacity: 0.85, fontSize: 16, lineHeight: 1.75 }}>{children}</p>;
}

export function Grid3({ children }: { children: any }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 16 }}>{children}</div>;
}

export function Grid2({ children }: { children: any }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>{children}</div>;
}

export function Card({
  title,
  right,
  children,
}: {
  title: string;
  right?: any;
  children: any;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(255,255,255,.03)",
        borderRadius: 18,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ fontWeight: 950 }}>{title}</div>
        {right ? right : null}
      </div>
      <div style={{ opacity: 0.82, lineHeight: 1.65, fontSize: 13, marginTop: 8 }}>{children}</div>
    </div>
  );
}

export function CTA({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        textDecoration: "none",
        color: "white",
        fontWeight: 900,
        fontSize: 13,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,.12)",
        background: "rgba(255,255,255,.06)",
      }}
    >
      {label} →
    </Link>
  );
}

export function Button({
  href,
  label,
  children,
  variant,
}: {
  href: string;
  label?: string;
  children?: React.ReactNode;
  variant?: string;
}) {
  const text = label ?? (typeof children === "string" ? children : undefined) ?? "Learn more";
  return <CTA href={href} label={text} />;
}
export function Chip({ text }: { text: string }) {
  return (
    <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 12, background: "rgba(255,255,255,.12)" }}>
      {text}
    </span>
  );
}
