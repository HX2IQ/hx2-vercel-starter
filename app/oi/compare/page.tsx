import { H1, P, Card, Grid2 } from "../_ui/ui";

export const metadata = {
  alternates: { canonical: "/oi/compare" },
  openGraph: { url: "https://optinodeiq.com/oi/compare" },
};

export const dynamic = "force-dynamic";

async function getData() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const url = `${base}/api/retail/product-compare`;

  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

export default async function ComparePage() {
  const { ok, status, data } = await getData();

  return (
    <div>
      <H1>Product Compare</H1>
      <P>Public demo — plain-English comparison output.</P>

      {!ok ? (
        <Card title="Error" right={`HTTP ${status}`}>
          <pre className="text-xs text-white/70 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </Card>
      ) : (
        <Grid2>
          {(data?.products || []).map((p: any) => (
            <Card key={p.key} title={p.name || p.key}>
              <div className="text-sm text-white/70 leading-relaxed">{p.summary || ""}</div>
              <ul className="mt-4 list-disc pl-5 text-sm text-white/70 space-y-2">
                {(p.bullets || []).map((b: string, i: number) => <li key={i}>{b}</li>)}
              </ul>
            </Card>
          ))}
        </Grid2>
      )}
    </div>
  );
}
