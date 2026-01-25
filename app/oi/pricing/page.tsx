import { H1, P, Card, Grid3, Button } from "../_ui/ui";

export const dynamic = "force-dynamic";

const tiers = [
  {
    name: "Free Demo", tag: "Public",
    price: "$0",
    desc: "See real endpoints working with clean UI.",
    features: ["Product compare demo", "Public nodes directory", "Waitlist capture"],
    cta: { href: "/oi/compare", label: "View demo" },
  },
  {
    name: "Retail Starter", tag: "Soon",
    price: "TBD",
    desc: "Lead capture + product pages + basic analytics.",
    features: ["Lead capture forms", "Product pages", "Simple conversion tracking"],
    cta: { href: "/oi/waitlist", label: "Get early access" },
  },
  {
    name: "Enterprise OI", tag: "Invite",
    price: "Custom",
    desc: "Full OI stack with worker + governance controls.",
    features: ["HX2/AP2 integration", "Audit logs", "Owner-only controls"],
    cta: { href: "/oi/about", label: "Talk to us" },
  },
];

export default function PricingPage() {
  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <H1>Pricing</H1>
          <P>Simple tiers now. We’ll expand once retail onboarding is fully polished.</P>
        </div>
        <Button href="/oi/products" variant="ghost">Products</Button>
      </div>

      <div className="mt-8">
        <Grid3>
          {tiers.map((t) => (
            <Card key={t.name} title={t.name} right={<span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 12, background: "rgba(255,255,255,.12)" }}>{t.badge}</span>}>
              <div className="text-3xl font-extrabold">{t.price}</div>
              <div className="mt-2 text-sm text-white/70 leading-relaxed">{t.desc}</div>

              <ul className="mt-4 space-y-2 text-sm text-white/75 list-disc pl-5">
                {t.features.map((f) => <li key={f}>{f}</li>)}
              </ul>

              <div className="mt-5">
                <Button href={t.cta.href}>{t.cta.label}</Button>
              </div>
            </Card>
          ))}
        </Grid3>
      </div>

      <div className="mt-10 text-sm text-white/60">
        Note: This is a public-facing placeholder until checkout + policy pages are finalized.
      </div>
    </div>
  );
}
