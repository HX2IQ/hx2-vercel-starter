export const dynamic = "force-dynamic";

function Pill({ text }: { text: string }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 12px",
      borderRadius: 999,
      fontSize: 12,
      border: "1px solid rgba(255,255,255,.10)",
      background: "rgba(255,255,255,.04)",
      color: "rgba(255,255,255,.88)"
    }}>
      {text}
    </span>
  );
}

function Card({ title, children }: { title: string; children: any }) {
  return (
    <div style={{
      border: "1px solid rgba(255,255,255,.10)",
      background: "rgba(255,255,255,.03)",
      borderRadius: 18,
      padding: 16
    }}>
      <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 8 }}>{title}</div>
      <div style={{ opacity: 0.82, lineHeight: 1.6, fontSize: 13 }}>{children}</div>
    </div>
  );
}

export default function AboutOIPage() {
  return (
    <main>
      <div style={{
        border: "1px solid rgba(255,255,255,.10)",
        background: "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",
        borderRadius: 22,
        padding: 22
      }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Pill text="Premium public demo" />
          <Pill text="Retail nodes live on optinodeoi.com" />
          <Pill text="Internal engine remains protected" />
        </div>

        <h1 style={{ fontSize: 34, margin: "6px 0 8px", fontWeight: 950, letterSpacing: -0.4 }}>
          What is OI?
        </h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: 15, lineHeight: 1.7, maxWidth: 900 }}>
          <b>OI (Optimized Intelligence)</b> is the public, retail-friendly layer of the Optinode ecosystem.
          It demonstrates real endpoints working with clean UI — product compare, waitlist capture, lead capture, and a public nodes directory —
          while keeping the internal “brain” logic private.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 14,
        marginTop: 16
      }}>
        <Card title="Public Layer (OI)">
          Customer-facing pages, demos, and retail nodes. Safe by design. Clean UX. Fast iteration.
        </Card>
        <Card title="Internal Layer (IQ)">
          The private orchestration + scoring logic. Never exposed publicly. IP-Firewalled.
        </Card>
        <Card title="Why this split matters">
          It lets you market and sell OI confidently, while keeping the proprietary engine protected.
        </Card>
      </div>

      <div style={{
        marginTop: 16,
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(255,255,255,.02)",
        borderRadius: 22,
        padding: 18
      }}>
        <div style={{ fontWeight: 950, marginBottom: 8 }}>What’s live right now</div>
        <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85, lineHeight: 1.7 }}>
          <li>/oi/compare — Product comparison demo (real API)</li>
          <li>/oi/waitlist — Waitlist capture (real API)</li>
          <li>/oi/nodes — Public nodes directory</li>
          <li>/oi/status — System status snapshot</li>
        </ul>
      </div>
    </main>
  );
}
