import Link from "next/link";

export const dynamic = "force-dynamic";

function Pill({ text }: { text: string }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 12px",
      borderRadius: 999,
      fontSize: 12,
      border: "1px solid rgba(255,255,255,.10)",
      background: "rgba(255,255,255,.04)",
      color: "rgba(255,255,255,.88)"
    }}>
      {text}
    </span>
  );
}

function Card({ title, children }: { title: string; children: any }) {
  return (
    <div style={{
      border: "1px solid rgba(255,255,255,.10)",
      background: "rgba(255,255,255,.03)",
      borderRadius: 18,
      padding: 16
    }}>
      <div style={{ fontWeight: 950, marginBottom: 8 }}>{title}</div>
      <div style={{ opacity: 0.82, lineHeight: 1.65, fontSize: 13 }}>{children}</div>
    </div>
  );
}

function CTA({ href, label }: { href: string; label: string }) {
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
        background: "rgba(255,255,255,.06)"
      }}
    >
      {label} →
    </Link>
  );
}

function TopNav() {
  const items = [
    { href: "/oi/about", label: "About" },
    { href: "/oi/products", label: "Products" },
    { href: "/oi/pricing", label: "Pricing" },
    { href: "/oi/compare", label: "Compare" },
    { href: "/oi/nodes", label: "Nodes" },
    { href: "/oi/status", label: "Status" },
  ];

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      padding: "14px 0",
      marginBottom: 10
    }}>
      <Link href="/oi" style={{ textDecoration: "none", color: "white", fontWeight: 950, letterSpacing: -0.2 }}>
        Optinode OI
      </Link>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
        {items.map(i => (
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
              background: "rgba(255,255,255,.02)"
            }}
          >
            {i.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function OIHomePage() {
  return (
    <main>
      <TopNav />

      {/* HERO */}
      <div style={{
        border: "1px solid rgba(255,255,255,.10)",
        background: "linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.02))",
        borderRadius: 22,
        padding: 24
      }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Pill text="Public retail layer" />
          <Pill text="Real endpoints live" />
          <Pill text="IP-safe by design" />
        </div>

        <h1 style={{ fontSize: 42, margin: "8px 0 10px", fontWeight: 1000, letterSpacing: -0.7 }}>
          Optimized Intelligence.
          <span style={{ opacity: 0.85 }}> Built to sell.</span>
        </h1>

        <p style={{ margin: 0, opacity: 0.85, fontSize: 16, lineHeight: 1.75, maxWidth: 980 }}>
          Optinode OI is the <b>premium public surface</b> for retail nodes — product compare, waitlist, lead capture, and a public node directory —
          while the proprietary engine stays protected behind the firewall.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <CTA href="/oi/about" label="What is OI" />
          <CTA href="/oi/compare" label="See product compare" />
          <CTA href="/oi/waitlist" label="Join waitlist" />
        </div>
      </div>

      {/* VALUE CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 16 }}>
        <Card title="Premium UX">
          Clean layout, consistent styling, and conversion-first pages that feel high-end — not “dev demo”.
        </Card>
        <Card title="Real functionality">
          Live API routes under the hood (waitlist, compare, lead capture, nodes) — not static mockups.
        </Card>
        <Card title="Protected engine">
          OI can be public confidently. Internal orchestration remains private (IP-firewalled).
        </Card>
      </div>

      {/* QUICK LINKS */}
      <div style={{
        marginTop: 16,
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(255,255,255,.02)",
        borderRadius: 22,
        padding: 18
      }}>
        <div style={{ fontWeight: 950, marginBottom: 8 }}>Quick links</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <CTA href="/oi/products" label="Products" />
          <CTA href="/oi/pricing" label="Pricing" />
          <CTA href="/oi/nodes" label="Public nodes" />
          <CTA href="/oi/status" label="System status" />
        </div>
      </div>

      <div style={{ marginTop: 14, opacity: 0.6, fontSize: 12, lineHeight: 1.6 }}>
        © {new Date().getFullYear()} Optinode. OI is the public retail layer. Internal engine remains private.
      </div>
    </main>
  );
}
