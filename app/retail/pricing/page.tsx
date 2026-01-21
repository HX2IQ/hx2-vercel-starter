export const dynamic = "force-dynamic";

export default function PricingPage() {
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 0 }}>Pricing</h1>
      <p style={{ opacity: 0.8, maxWidth: 760 }}>
        We’re finalizing packages. For now, request access and we’ll place you into the right beta tier.
      </p>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {[
          { name: "Starter", price: "Coming soon", bullets: ["Single node", "Basic exports", "Email support"] },
          { name: "Pro", price: "Coming soon", bullets: ["Multiple nodes", "Integrations", "Priority support"] },
          { name: "Enterprise", price: "Talk to us", bullets: ["Custom wiring", "Security", "SLA / onboarding"] },
        ].map(t => (
          <div key={t.name} style={{ padding: 14, borderRadius: 16, border: "1px solid rgba(0,0,0,0.12)" }}>
            <div style={{ fontWeight: 900 }}>{t.name}</div>
            <div style={{ marginTop: 6, opacity: 0.75 }}>{t.price}</div>
            <ul style={{ marginTop: 10, opacity: 0.85 }}>
              {t.bullets.map(b => <li key={b}>{b}</li>)}
            </ul>
            <a href="/waitlist" style={{ textDecoration: "none", padding: "9px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)" }}>
              Request access
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
