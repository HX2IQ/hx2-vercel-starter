export const dynamic = "force-dynamic";

export default function OIHomePage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          border: "1px solid rgba(255,255,255,.10)",
          background: "rgba(0,0,0,.70)",
          boxShadow: "0 18px 60px rgba(0,0,0,.55)",
          borderRadius: 22,
          padding: 24,
          backdropFilter: "blur(10px)"
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          {["Public retail layer", "Real endpoints live", "IP-safe by design"].map((x) => (
            <span
              key={x}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 12,
                border: "1px solid rgba(16,185,129,.28)",
                background: "rgba(16,185,129,.10)",
                color: "rgba(255,255,255,.92)"
              }}
            >
              {x}
            </span>
          ))}
        </div>

        <h1 style={{ fontSize: 42, margin: "8px 0 10px", fontWeight: 1000, letterSpacing: -0.7 }}>
          Optimized Intelligence.<span style={{ opacity: 0.85 }}> Built to sell.</span>
        </h1>

        <p style={{ margin: 0, opacity: 0.88, fontSize: 16, lineHeight: 1.75 }}>
          Optinode OI is the <b>premium public surface</b> for retail nodes — product compare, waitlist, lead capture,
          and a public node directory — while the proprietary engine stays protected behind the firewall.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <a href="/oi/about" style={ctaStyle()}>What is OI →</a>
          <a href="/oi/compare" style={ctaStyle()}>See product compare →</a>
          <a href="/oi/waitlist" style={ctaStyle()}>Join waitlist →</a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 16 }}>
          {[
            ["Premium UX", "Clean layout, consistent styling, and conversion-first pages that feel high-end."],
            ["Real functionality", "Live API routes under the hood — not static mockups."],
            ["Protected engine", "OI can be public confidently. Internal orchestration stays private."]
          ].map(([title, body]) => (
            <div
              key={title}
              style={{
                border: "1px solid rgba(255,255,255,.10)",
                background: "rgba(255,255,255,.03)",
                borderRadius: 18,
                padding: 16
              }}
            >
              <div style={{ fontWeight: 950 }}>{title}</div>
              <div style={{ opacity: 0.82, lineHeight: 1.65, fontSize: 13, marginTop: 8 }}>{body}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            border: "1px solid rgba(16,185,129,.22)",
            background: "rgba(0,0,0,.55)",
            borderRadius: 22,
            padding: 18
          }}
        >
          <div style={{ fontWeight: 950, marginBottom: 8 }}>Quick links</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/oi/products" style={ctaStyle()}>Products →</a>
            <a href="/oi/pricing" style={ctaStyle()}>Pricing →</a>
            <a href="/oi/nodes" style={ctaStyle()}>Public nodes →</a>
            <a href="/oi/status" style={ctaStyle()}>System status →</a>
          </div>
        </div>
      </div>
    </main>
  );
}

function ctaStyle(): React.CSSProperties {
  return {
    display: "inline-flex",
    textDecoration: "none",
    color: "white",
    fontWeight: 900,
    fontSize: 13,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(16,185,129,.35)",
    background: "rgba(16,185,129,.12)"
  };
}
