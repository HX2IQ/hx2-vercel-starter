import { H1, P, Card, Grid2, Button } from "../_ui/ui";

export const dynamic = "force-dynamic";

export default function AboutOI() {
  return (
    <div>
      <H1>What is OI?</H1>
      <P>
        <b className="text-white">OI = Optimized Intelligence.</b> It’s a clean, retail-friendly way to deliver “answers that act like tools.”
        Simple inputs, clear outputs, no fluff — and each capability lives in a “node” you can turn on as you scale.
      </P>

      <div className="mt-6 flex gap-3">
        <Button href="/oi/nodes" variant="ghost">See installed nodes</Button>
        <Button href="/oi/lead">Request access</Button>
      </div>

      <Grid2>
        <Card title="Retail Nodes (Public)">
          <P>These are the pages customers can use right away: waitlist, lead capture, product compare, and more.</P>
          <ul className="mt-4 list-disc pl-5 text-sm text-white/70 space-y-2">
            <li>Fast</li>
            <li>Simple</li>
            <li>Premium UI</li>
            <li>Public-safe outputs</li>
          </ul>
        </Card>

        <Card title="Core Engine (Private)">
          <P>The registry + worker system runs behind the scenes. Public pages never expose private internals.</P>
          <ul className="mt-4 list-disc pl-5 text-sm text-white/70 space-y-2">
            <li>Registry installs nodes</li>
            <li>AP2 worker executes tasks</li>
            <li>Redis stores lightweight state</li>
          </ul>
        </Card>
      </Grid2>

      <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <div className="text-sm font-extrabold">Why it matters</div>
        <div className="mt-2 text-sm text-white/70 leading-relaxed">
          Most “AI” feels like a chat toy. OI is built to feel like a <b className="text-white">product</b>:
          predictable pages, consistent outputs, and nodes you can sell one-by-one.
        </div>
      </div>
    </div>
  );
}
