import Link from "next/link";
import { Hero, Pill } from "../_ui/shell";

export const dynamic = "force-dynamic";

function Card({ title, children }: { title: string; children: any }) {
  return (
    <div style={{
      border: "1px solid rgba(255,255,255,.10)",
      background: "rgba(255,255,255,.03)",
      borderRadius: 18,
      padding: 18
    }}>
      <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 10 }}>{title}</div>
      <div style={{ opacity: 0.82, lineHeight: 1.55, fontSize: 13 }}>{children}</div>
    </div>
  );
}

function CTA({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <Link href={href} style={{
      display: "block",
      borderRadius: 18,
      padding: 18,
      textDecoration: "none",
      color: "white",
      border: "1px solid rgba(255,255,255,.12)",
      background: "linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.03))"
    }}>
      <div style={{ fontWeight: 950, fontSize: 14 }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.78 }}>{sub}</div>
      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.9 }}>Open →</div>
    </Link>
  );
}

export default function AboutPage() {
  return (
    <div>
      <Hero
        title="What is OI?"
        subtitle="OI (Optimized Intelligence) is a premium retail-facing layer: clean, public pages backed by real working endpoints — not mockups. It demonstrates capability while keeping the private intelligence engine protected."
        right={<Pill>Public demo • Real endpoints • Premium UX</Pill>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 16 }}>
        <Card title="1) Retail first">
          OI is designed for public trust: simple pages, fast demos, and clear outcomes (compare, capture, directory).
        </Card>
        <Card title="2) Real data paths">
          Every public page is backed by an API route so the system proves itself. If an endpoint breaks, the UI shows it.
        </Card>
        <Card title="3) IP-safe by design">
          OI can demonstrate value without exposing internal logic, prompts, weights, or private orchestration details.
        </Card>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 10 }}>Live demos</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <CTA href="/oi/compare" label="Product Compare" sub="Plain-English comparison powered by /api/retail/product-compare" />
          <CTA href="/oi/nodes" label="Public Nodes Directory" sub="Shows installed nodes (public-safe) via /api/oi/public/nodes" />
          <CTA href="/oi/waitlist" label="Waitlist Capture" sub="Lead capture demo backed by /api/retail/waitlist" />
        </div>
      </div>

      <div style={{
        marginTop: 18,
        borderRadius: 22,
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(255,255,255,.03)",
        padding: 18
      }}>
        <div style={{ fontWeight: 950, fontSize: 16 }}>Positioning (short + premium)</div>
        <div style={{ marginTop: 8, opacity: 0.82, fontSize: 13, lineHeight: 1.55 }}>
          <b>OI</b> is the customer-facing layer. It’s what the world sees: clean pages that demonstrate real capability.
          The private engine stays private. This makes OI deployable, brandable, and safe to scale.
        </div>
      </div>
    </div>
  );
}
