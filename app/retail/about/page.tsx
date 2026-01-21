export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 860 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 0 }}>About OptinodeIQ</h1>
      <p style={{ opacity: 0.85 }}>
        OptinodeIQ builds task-focused “nodes” — tools designed to produce useful outputs quickly, safely, and consistently.
      </p>
      <h2 style={{ fontSize: 16, fontWeight: 900 }}>What you can expect</h2>
      <ul style={{ opacity: 0.85 }}>
        <li>Clear outputs (not vague chat)</li>
        <li>Retail-simple experience</li>
        <li>Safety + privacy by design</li>
      </ul>
      <a href="/waitlist" style={{ textDecoration: "none", padding: "9px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)" }}>
        Join waitlist
      </a>
    </div>
  );
}
