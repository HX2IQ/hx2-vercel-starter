import { H1, P, Card, Grid2, Button } from "../_ui/ui";

export const dynamic = "force-dynamic";

export default function OIRetailLanding() {
  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <H1>Retail Nodes</H1>
          <P>Public-facing tools that convert visitors into leads, buyers, and repeat customers.</P>
        </div>
        <Button href="/oi/waitlist">Get updates</Button>
      </div>

      <div className="mt-8">
        <Grid2>
          <Card title="Lead Capture" right="Live">
            <div className="text-sm text-white/70 leading-relaxed">
              Email capture with Redis persistence. Clean, fast, reliable.
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Button href="/oi/waitlist">Open waitlist</Button>
              <Button href="/retail/waitlist" variant="ghost">Legacy retail page</Button>
            </div>
          </Card>

          <Card title="Product Compare" right="Live">
            <div className="text-sm text-white/70 leading-relaxed">
              Comparison endpoint + UI page for public demos and sales enablement.
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Button href="/oi/compare">Open compare</Button>
              <Button href="/api/retail/product-compare" variant="ghost">View API</Button>
            </div>
          </Card>

          <Card title="Public Nodes Directory" right="Live">
            <div className="text-sm text-white/70 leading-relaxed">
              Public list of installed nodes (sanitized). Helps build trust.
            </div>
            <div className="mt-4">
              <Button href="/oi/nodes">View nodes</Button>
            </div>
          </Card>

          <Card title="Next: Premium Product Pages" right="Queued">
            <div className="text-sm text-white/70 leading-relaxed">
              /oi/products (hero + product cards) + /oi/pricing (simple tiers) + testimonials.
            </div>
            <div className="mt-4">
              <Button href="/oi/about" variant="ghost">About OI</Button>
            </div>
          </Card>
        </Grid2>
      </div>
    </div>
  );
}
