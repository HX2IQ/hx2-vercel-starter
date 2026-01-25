import Link from "next/link";

export const dynamic = "force-dynamic";

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "white",
        opacity: 0.85,
        fontSize: 13,
        padding: "8px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(255,255,255,.03)",
      }}
    >
      {label}
    </Link>
  );
}

export default function OILayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(10px)",
          background: "rgba(0,0,0,.65)",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Link href="/oi" style={{ textDecoration: "none", color: "white" }}>
            <div style={{ fontWeight: 950, letterSpacing: 0.2 }}>Optinode OI</div>
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>Optimized Intelligence • Public Layer</div>
          </Link>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <NavLink href="/oi/about" label="What is OI" />
            <NavLink href="/oi/nodes" label="Nodes" />
            <NavLink href="/oi/compare" label="Compare" />
            <NavLink href="/oi/products" label="Products" />
            <NavLink href="/oi/pricing" label="Pricing" />
            <NavLink href="/oi/waitlist" label="Waitlist" />
            <NavLink href="/oi/status" label="Status" />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        {children}
        <div style={{ marginTop: 26, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.08)", opacity: 0.7, fontSize: 12 }}>
          © {new Date().getFullYear()} Optinode • OI is a public demo layer. Internal engine remains protected.
        </div>
      </div>
    </div>
  );
}
