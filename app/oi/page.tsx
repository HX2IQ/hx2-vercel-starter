import { H1, P, Card, Grid3, Pill, CTA } from "./_ui/ui";

export const dynamic = "force-dynamic";

export default function OIHomePage() {
  return (
    <main>
      <div
        style={{
          border: "1px solid rgba(255,255,255,.10)",
          background: "linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.02))",
          borderRadius: 22,
          padding: 24,
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Pill text="Public retail layer" />
          <Pill text="Real endpoints live" />
          <Pill text="IP-safe by design" />
        </div>

        <H1>
          Optimized Intelligence.<span style={{ opacity: 0.85 }}> Built to sell.</span>
        </H1>

        <P>
          Optinode OI is the <b>premium public surface</b> for retail nodes — product compare, waitlist, lead capture,
          and a public node directory — while the proprietary engine stays protected behind the firewall.
        </P>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <CTA href="/oi/about" label="What is OI" />
          <CTA href="/oi/compare" label="See product compare" />
          <CTA href="/oi/waitlist" label="Join waitlist" />
        </div>
      </div>

      <Grid3>
        <Card title="Premium UX">Clean layout, consistent styling, and conversion-first pages that feel high-end.</Card>
        <Card title="Real functionality">Live API routes under the hood — not static mockups.</Card>
        <Card title="Protected engine">OI can be public confidently. Internal orchestration stays private.</Card>
      </Grid3>

      <div
        style={{
          marginTop: 16,
          border: "1px solid rgba(255,255,255,.10)",
          background: "rgba(255,255,255,.02)",
          borderRadius: 22,
          padding: 18,
        }}
      >
        <div style={{ fontWeight: 950, marginBottom: 8 }}>Quick links</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <CTA href="/oi/products" label="Products" />
          <CTA href="/oi/pricing" label="Pricing" />
          <CTA href="/oi/nodes" label="Public nodes" />
          <CTA href="/oi/status" label="System status" />
        </div>
      </div>
    </main>
  );
}
