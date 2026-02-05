export const runtime = "nodejs";

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 34, fontWeight: 700, margin: "0 0 10px" }}>About</h1>
      <p style={{ lineHeight: 1.6, opacity: 0.9 }}>
        This site is built around <a href="/opti">Opti</a> — short for Optimized Intelligence —
        a structured approach to making AI more useful, safer, and more repeatable.
      </p>
    </main>
  );
}
