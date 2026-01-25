export default function RetailHubPage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>OI Retail</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Public demo retail endpoints + pages.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <a href="/oi/compare" style={{ padding: 14, border: "1px solid rgba(0,0,0,.12)", borderRadius: 12, textDecoration: "none" }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Product Compare</div>
          <div style={{ opacity: 0.85, marginTop: 4 }}>/oi/compare</div>
        </a>

        <a href="/oi/nodes" style={{ padding: 14, border: "1px solid rgba(0,0,0,.12)", borderRadius: 12, textDecoration: "none" }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Built Nodes</div>
          <div style={{ opacity: 0.85, marginTop: 4 }}>/oi/nodes</div>
        </a>

        <a href="/oi/waitlist" style={{ padding: 14, border: "1px solid rgba(0,0,0,.12)", borderRadius: 12, textDecoration: "none" }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Waitlist (Lead Capture)</div>
          <div style={{ opacity: 0.85, marginTop: 4 }}>/oi/waitlist</div>
        </a>
      </div>
    </main>
  );
}
