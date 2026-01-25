import Link from "next/link";

export const dynamic = "force-dynamic";

const products = [
  {
    title: "Koenig Spray Polish",
    tag: "Flagship",
    desc: "Multi-surface spray polish: glass, stainless, paint, RVs, boats, and home windows.",
    bullets: ["Fast clean + shine", "Great for salt spray + water spots", "Retail-friendly demo"],
    cta: { href: "/oi/compare", label: "See compare demo" },
  },
  {
    title: "Optinode OI Retail Nodes",
    tag: "Platform",
    desc: "Public-facing node experiences that feel premium and convert (waitlist, compare, lead capture).",
    bullets: ["Clean UX", "Real endpoints", "Safe by design (no brain exposure)"],
    cta: { href: "/oi/nodes", label: "View nodes" },
  },
  {
    title: "Lead Capture",
    tag: "Conversion",
    desc: "Capture high-intent leads with lightweight forms and reliable storage.",
    bullets: ["Simple API", "Can route to CRM later", "Fast iteration"],
    cta: { href: "/oi/waitlist", label: "Join waitlist" },
  },
];

function Chip({ text }: { text: string }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 12,
      border: "1px solid rgba(255,255,255,.10)",
      background: "rgba(255,255,255,.04)",
      opacity: 0.9
    }}>
      {text}
    </span>
  );
}

function Card({ title, right, children }: { title: string; right?: any; children: any }) {
  return (
    <div style={{
      border: "1px solid rgba(255,255,255,.10)",
      background: "rgba(255,255,255,.03)",
      borderRadius: 18,
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ fontWeight: 950 }}>{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <main>
      <div style={{
        border: "1px solid rgba(255,255,255,.10)",
        background: "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",
        borderRadius: 22,
        padding: 22
      }}>
        <h1 style={{ fontSize: 34, margin: "6px 0 8px", fontWeight: 950, letterSpacing: -0.4 }}>Products</h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: 15, lineHeight: 1.7, maxWidth: 900 }}>
          A premium public surface for OI + select retail demos (built to convert, built to scale).
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 16 }}>
        {products.map((p) => (
          <Card key={p.title} title={p.title} right={<Chip text={p.tag} />}>
            <div style={{ opacity: 0.82, lineHeight: 1.6, fontSize: 13 }}>{p.desc}</div>
            <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85, lineHeight: 1.7 }}>
              {p.bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <div style={{ marginTop: 4 }}>
              <Link
                href={p.cta.href}
                style={{
                  display: "inline-flex",
                  textDecoration: "none",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 13,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(255,255,255,.06)"
                }}
              >
                {p.cta.label} →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
