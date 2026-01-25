export const dynamic = "force-dynamic";

function LinkCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <a href={href} style={{
      display: "block",
      border: "1px solid rgba(255,255,255,.12)",
      borderRadius: 16,
      padding: 16,
      textDecoration: "none",
      color: "inherit"
    }}>
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>{title}</div>
      <div style={{ opacity: 0.75, fontSize: 13 }}>{desc}</div>
      <div style={{ marginTop: 10, opacity: 0.9, fontSize: 12 }}>{href} →</div>
    </a>
  );
}

export default function OIHome() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ fontSize: 34, marginBottom: 6 }}>OptinodeOI</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Public demo hub for retail OI nodes.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
        <LinkCard href="/oi/nodes" title="Public Nodes" desc="See what nodes exist right now." />
        <LinkCard href="/oi/compare" title="Product Compare" desc="Public comparison demo endpoint + UI." />
        <LinkCard href="/oi/waitlist" title="Waitlist" desc="Lead capture for retail launch." />
        <LinkCard href="/oi/retail" title="Retail Hub" desc="Retail entry point (products/pricing/etc)." />
      </div>

      <div style={{ marginTop: 22, opacity: 0.6, fontSize: 12 }}>
        Admin/health endpoints may move behind auth later.
      </div>
    </main>
  );
}
