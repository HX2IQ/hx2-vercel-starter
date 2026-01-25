import Link from "next/link";

export function Container({ children }: { children: any }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
      {children}
    </div>
  );
}

export function SiteHeader() {
  const nav = [
    { href: "/oi", label: "OI" },
    { href: "/oi/about", label: "About" },
    { href: "/oi/products", label: "Products" },
    { href: "/oi/compare", label: "Compare" },
    { href: "/oi/nodes", label: "Nodes" },
    { href: "/oi/waitlist", label: "Waitlist" },
    { href: "/oi/status", label: "Status" },
  ];

  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      backdropFilter: "blur(10px)",
      background: "rgba(0,0,0,.55)",
      borderBottom: "1px solid rgba(255,255,255,.08)"
    }}>
      <Container>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0" }}>
          <Link href="/oi" style={{ display: "flex", gap: 10, alignItems: "center", textDecoration: "none", color: "white" }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, rgba(255,255,255,.2), rgba(255,255,255,.05))",
              border: "1px solid rgba(255,255,255,.12)"
            }} />
            <div>
              <div style={{ fontWeight: 900, letterSpacing: 0.4 }}>Optinode OI</div>
              <div style={{ fontSize: 12, opacity: 0.65, marginTop: 1 }}>Premium retail intelligence demos</div>
            </div>
          </Link>

          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {nav.map((n) => (
              <Link key={n.href} href={n.href} style={{
                color: "rgba(255,255,255,.82)",
                textDecoration: "none",
                fontSize: 13,
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.08)",
                background: "rgba(255,255,255,.03)"
              }}>
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

export function SiteFooter() {
  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", marginTop: 44, padding: "26px 0", color: "rgba(255,255,255,.65)" }}>
      <Container>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 800, color: "white" }}>Optinode OI</div>
            <div style={{ fontSize: 12, marginTop: 6, maxWidth: 520 }}>
              OI = Optimized Intelligence. Public demos backed by real endpoints (no fake screenshots).
            </div>
          </div>
          <div style={{ fontSize: 12, textAlign: "right" }}>
            <div>© {new Date().getFullYear()} Optinode</div>
            <div style={{ marginTop: 6, opacity: 0.75 }}>Built on Next.js + Vercel</div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export function Hero({ title, subtitle, right }: { title: string; subtitle?: string; right?: any }) {
  return (
    <div style={{
      marginTop: 28,
      padding: 22,
      borderRadius: 22,
      border: "1px solid rgba(255,255,255,.1)",
      background: "linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.02))"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: -0.4 }}>{title}</div>
          {subtitle ? <div style={{ marginTop: 8, fontSize: 14, opacity: 0.78, maxWidth: 760, lineHeight: 1.5 }}>{subtitle}</div> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
    </div>
  );
}

export function Pill({ children }: { children: any }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 12px",
      borderRadius: 999,
      fontSize: 12,
      border: "1px solid rgba(255,255,255,.12)",
      background: "rgba(255,255,255,.04)",
      color: "rgba(255,255,255,.88)"
    }}>
      {children}
    </span>
  );
}
