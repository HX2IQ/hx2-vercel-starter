import { H1, P, Card, Grid3, Button } from "./_ui/ui";

export const dynamic = "force-dynamic";

export default function OIHome() {
  return (
    <div>
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="max-w-2xl">
          <H1>OptinodeOI</H1>
          <P>
            OI = Optimized (not Artificial) Intelligence — retail-safe tools that do real work: compare, decide, and act.
          </P>

          <div className="mt-6 flex gap-3 flex-wrap">
            <Button href="/oi/about">What is OI</Button>
            <Button href="/oi/waitlist" variant="ghost">Join waitlist</Button>
          </div>

          <div className="mt-6 text-sm text-white/55">
            Public demo running on live infrastructure. No hype. Just working endpoints and clean UX.
          </div>
        </div>

        <div className="min-w-[280px] flex-1">
          <Card title="Live Status" right="Public">
            <div className="text-sm text-white/70">
              • Product compare demo<br/>
              • Public node registry view<br/>
              • Waitlist capture (Redis)<br/>
            </div>
            <div className="mt-4">
              <Button href="/oi/status" variant="ghost">System status</Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Grid3>
          <Card title="Compare" right="Demo">
            <div className="text-sm text-white/70 leading-relaxed">
              Plain-English product comparisons so a customer can decide fast.
            </div>
            <div className="mt-4">
              <Button href="/oi/compare">Open compare</Button>
            </div>
          </Card>

          <Card title="Nodes" right="Public">
            <div className="text-sm text-white/70 leading-relaxed">
              See what’s installed and live right now (public-safe fields only).
            </div>
            <div className="mt-4">
              <Button href="/oi/nodes">View nodes</Button>
            </div>
          </Card>

          <Card title="Retail" right="Landing">
            <div className="text-sm text-white/70 leading-relaxed">
              The retail suite: lead capture, product pages, and onboarding.
            </div>
            <div className="mt-4">
              <Button href="/oi/retail">Open retail</Button>
            </div>
          </Card>
        </Grid3>
      </div>
    </div>
  );
}
