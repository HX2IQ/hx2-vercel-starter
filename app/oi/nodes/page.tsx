import { H1, P, Card, Grid2, Button } from "../_ui/ui";

export const metadata = {
  alternates: { canonical: "/oi/nodes" },
  openGraph: { url: "https://optinodeiq.com/oi/nodes" },
};

export const dynamic = "force-dynamic";

async function getData() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const url = `${base}/api/oi/public/nodes`;

  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

export default async function NodesPage() {
  const { ok, status, data } = await getData();
  const nodes = data?.nodes || [];

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <H1>Installed Nodes</H1>
          <P>Public view of what’s live right now.</P>
        </div>
        <Button href="/oi/waitlist">Get updates</Button>
      </div>

      {!ok ? (
        <Card title="Error" right={`HTTP ${status}`}>
          <pre className="text-xs text-white/70 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </Card>
      ) : nodes.length === 0 ? (
        <Card title="No nodes yet">
          <P>If this is unexpected, the public nodes API may not be deployed on this domain.</P>
        </Card>
      ) : (
        <Grid2>
          {nodes.map((n: any) => (
            <Card
              key={n.id}
              title={n.name || n.id}
              right={n.version ? `v${n.version}` : undefined}
            >
              <div className="text-sm text-white/70 leading-relaxed">
                {n.description || "—"}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/10 px-3 py-1 text-white/70">
                  {n.type || "node"}
                </span>
                {n.status ? (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-white/70">
                    {n.status}
                  </span>
                ) : null}
              </div>
            </Card>
          ))}
        </Grid2>
      )}
    </div>
  );
}
