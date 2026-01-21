export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>OptinodeIQ</h1>
      <p style={{ opacity: 0.8, marginBottom: 18 }}>
        Retail Preview — progress dashboard + internal console tools.
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        <a href="/retail/progress" style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,0.15)", textDecoration: "none" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Retail Progress Dashboard</div>
          <div style={{ opacity: 0.75 }}>Shows live system health: Vercel, Redis, Registry, AP2, Node routes.</div>
        </a>

        <a href="/console" style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,0.15)", textDecoration: "none" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Console</div>
          <div style={{ opacity: 0.75 }}>Command console interface.</div>
        </a>

        <a href="/console/nodes" style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,0.15)", textDecoration: "none" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Console — Nodes Panel</div>
          <div style={{ opacity: 0.75 }}>One-click Ping/Describe/GET for any node route.</div>
        </a>
      </div>

      <div style={{ marginTop: 18, opacity: 0.65, fontSize: 12 }}>
        Note: This preview page intentionally exposes only SAFE system health signals.
      </div>
    </main>
  );
}
