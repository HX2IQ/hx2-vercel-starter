import Link from "next/link";

export const metadata = {
  alternates: { canonical: "/oi/pricing" },
  openGraph: { url: "https://optinodeiq.com/oi/pricing" },
};

export const dynamic = "force-dynamic";

const tiers = [
  {
    name: "Free Demo",
    tag: "Public",
    price: "$0",
    desc: "See real endpoints working with clean UI.",
    features: ["Product compare demo", "Public nodes directory", "Waitlist capture"],
    cta: { href: "/oi/compare", label: "View demo" },
  },
  {
    name: "Retail Launch",
    tag: "Starter",
    price: "TBD",
    desc: "Branded pages + lead capture + analytics hooks (no brain exposure).",
    features: ["Premium pages", "Lead capture pipeline", "Conversion-first UI"],
    cta: { href: "/oi/waitlist", label: "Join waitlist" },
  },
  {
    name: "Enterprise",
    tag: "Pro",
    price: "TBD",
    desc: "Custom nodes, integrations, governance, and rollout support.",
    features: ["Custom nodes", "CRM + data connectors", "Security + compliance posture"],
    cta: { href: "/oi/waitlist", label: "Talk to us" },
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

export default function PricingPage() {
  return (
    <main>
      <div style={{
        border: "1px solid rgba(255,255,255,.10)",
        background: "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",
        borderRadius: 22,
        padding: 22
      }}>
        <h1 style={{ fontSize: 34, margin: "6px 0 8px", fontWeight: 950, letterSpacing: -0.4 }}>Pricing</h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: 15, lineHeight: 1.7, maxWidth: 900 }}>
          Simple tiers for the public OI layer. Enterprise expansion lives behind the firewall.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 16 }}>
        {tiers.map((t) => (
          <Card key={t.name} title={t.name} right={<Chip text={t.tag} />}>
            <div style={{ fontSize: 30, fontWeight: 950, marginTop: 2 }}>{t.price}</div>
            <div style={{ opacity: 0.75, lineHeight: 1.6, fontSize: 13 }}>{t.desc}</div>
            <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85, lineHeight: 1.7 }}>
              {t.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <div style={{ marginTop: 4 }}>
              <Link
                href={t.cta.href}
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
                {t.cta.label} →
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <div style={{
        marginTop: 16,
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(255,255,255,.02)",
        borderRadius: 22,
        padding: 18,
        opacity: 0.85,
        lineHeight: 1.7
      }}>
        <b>Next:</b> once you approve the “premium look,” we’ll swap these inline styles into a single shared UI kit in <code>app/oi/_ui</code>
        so every page stays consistent without duplicating styles.
      </div>
    </main>
  );
}
