import { H1, P, Card, Grid3, Button } from "../_ui/ui";

export const dynamic = "force-dynamic";

const products = [
  {
    title: "Koenig Spray Polish", tag: "Flagship",
    desc: "Multi-surface spray polish: glass, stainless, paint, RV, boats, and home windows.",
    bullets: ["Fast clean + shine", "Great for salt spray + water spots", "Retail-friendly demo"],
    cta: { href: "/oi/compare", label: "See compare demo" },
  },
  {
    title: "Retail Lead Capture", tag: "Live",
    desc: "Email capture + Redis persistence. Built for speed and reliability.",
    bullets: ["Waitlist endpoint live", "Idempotent writes", "Works on optinodeoi.com"],
    cta: { href: "/oi/waitlist", label: "Join waitlist" },
  },
  {
    title: "Public Nodes Directory", tag: "Trust",
    desc: "Public-safe list of installed nodes so visitors can see what’s real and live.",
    bullets: ["Sanitized output", "Fast listing", "Builds credibility"],
    cta: { href: "/oi/nodes", label: "View nodes" },
  },
];

export default function ProductsPage() {
  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <H1>Products</H1>
          <P>Clean, premium pages that turn “what is this?” into action.</P>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button href="/oi/pricing">Pricing</Button>
          <Button href="/oi/about" variant="ghost">What is OI</Button>
        </div>
      </div>

      <div className="mt-8">
        <Grid3>
          {products.map((p) => (
            <Card
              key={p.title}
              title={p.title}
              right={<span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 12, background: "rgba(255,255,255,.12)" }}>{p.tag}</span>}
            >
              <div className="text-sm text-white/70 leading-relaxed">{p.desc}</div>

              <ul className="mt-4 space-y-2 text-sm text-white/75 list-disc pl-5">
                {p.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>

              <div className="mt-5">
                <Button href={p.cta.href}>{p.cta.label}</Button>
              </div>
            </Card>
          ))}
        </Grid3>
      </div>

      <div className="mt-10 border border-white/10 rounded-2xl p-6 bg-white/5">
        <div className="text-lg font-extrabold">Next Up</div>
        <div className="mt-2 text-sm text-white/70">
          Premium testimonials + before/after demos + a simple checkout bridge.
        </div>
      </div>
    </div>
  );
}
