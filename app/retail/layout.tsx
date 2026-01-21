export const dynamic = "force-dynamic";

export default function RetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid rgba(0,0,0,0.12)" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <a href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>OptinodeIQ</div>
            <div style={{ fontSize: 12, opacity: 0.65 }}>Retail Preview</div>
          </a>
          <nav style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <a href="/products" style={{ textDecoration: "none" }}>Products</a>
            <a href="/pricing" style={{ textDecoration: "none" }}>Pricing</a>
            <a href="/about" style={{ textDecoration: "none" }}>About</a>
            <a href="/waitlist" style={{ textDecoration: "none" }}>Join Waitlist</a>
            <a href="/retail/progress" style={{ textDecoration: "none", opacity: 0.75 }}>Progress</a>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "26px 20px" }}>
        {children}
      </main>

      <footer style={{ borderTop: "1px solid rgba(0,0,0,0.12)", marginTop: 30 }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "14px 20px", fontSize: 12, opacity: 0.75 }}>
          © {new Date().getFullYear()} OptinodeIQ — Retail Preview • <a href="/waitlist">Request access</a>
        </div>
      </footer>
    </div>
  );
}
