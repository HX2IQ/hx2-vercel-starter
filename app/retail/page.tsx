export const dynamic = "force-dynamic";

export default function RetailHome() {
  return (
    <div>
      <div style={{ display: "grid", gap: 14, padding: 18, borderRadius: 18, border: "1px solid rgba(0,0,0,0.12)" }}>
        <div style={{ fontSize: 12, opacity: 0.65 }}>RETAIL PREVIEW</div>
        <h1 style={{ fontSize: 34, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
          Optimized Intelligence tools you can actually use.
        </h1>
        <p style={{ margin: 0, opacity: 0.8, fontSize: 16, maxWidth: 760 }}>
          OptinodeIQ is building a suite of “nodes” — purpose-built tools for business, sales, health, legal, and trade shows —
          delivered through a simple retail experience.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
          <a href="/products" style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)", textDecoration: "none" }}>
            View Products
          </a>
          <a href="/waitlist" style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)", textDecoration: "none" }}>
            Join Waitlist
          </a>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>What’s live right now</h2>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {[
            { title: "TradeShowIQ (T2)", desc: "Scan booths → get verified lead intelligence.", tag: "Wiring in progress" },
            { title: "SalesIQ", desc: "Better calls, better pipeline, better closes.", tag: "Spec complete" },
            { title: "CRMIQ", desc: "Retention + loyalty + customer intelligence.", tag: "Spec complete" },
            { title: "Progress Dashboard", desc: "Live system health checks.", tag: "Live" },
          ].map((x) => (
            <div key={x.title} style={{ padding: 14, borderRadius: 16, border: "1px solid rgba(0,0,0,0.12)" }}>
              <div style={{ fontWeight: 900 }}>{x.title}</div>
              <div style={{ opacity: 0.8, marginTop: 6 }}>{x.desc}</div>
              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>{x.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
