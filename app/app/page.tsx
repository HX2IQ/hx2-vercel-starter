import Link from "next/link";

export default function RetailHub() {
  const cards = [
    { href: "/app/t2", title: "TradeShowIQ", desc: "Scan booth photos → instant lead intelligence" },
    { href: "/app/factcheck", title: "FactCheck", desc: "Verify claims, sources, and media quickly" },
    { href: "/app/health", title: "Health", desc: "Score labels / ingredients (SAFE stub for now)" },
    { href: "/app/shop", title: "Shop", desc: "Find products & parts fast (SAFE stub for now)" },
    { href: "/console", title: "Owner Console", desc: "Admin task runner (owner only)" },
  ];

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 6 }}>Optinode OI — App</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Retail-facing experience (clean UI). These are SAFE stubs wired to your backend.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 14 }}>
        {cards.map((c) => (
          <Link key={c.href} href={c.href} style={{ textDecoration: "none" }}>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#111827" }}>{c.title}</div>
              <div style={{ marginTop: 6, opacity: 0.8, color: "#111827" }}>{c.desc}</div>
              <div style={{ marginTop: 10, fontWeight: 800, color: "#111827" }}>Open →</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
