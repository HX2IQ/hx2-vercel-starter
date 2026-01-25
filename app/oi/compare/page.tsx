export const dynamic = "force-dynamic";

function getBaseUrl() {
  // Works on Vercel + local dev
  const host = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_SITE_URL || "");

  return host;
}

async function getData() {
  const base = getBaseUrl();
  const url = base ? `${base}/api/retail/product-compare` : "http://localhost:3000/api/retail/product-compare";

  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data, urlUsed: url };
}

function Card({ title, children }: { title: string; children: any }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,.12)", borderRadius: 14, padding: 14 }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

export default async function ComparePage() {
  const { ok, status, data, urlUsed } = await getData();

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Product Compare</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>Public demo</p>

      <p style={{ opacity: 0.6, marginTop: 0, fontSize: 12 }}>Data source: {urlUsed}</p>

      {!ok ? (
        <div>
          <b>Error:</b> {status}
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
          {(data?.products || []).map((p: any) => (
            <Card key={p.key} title={p.name || p.key}>
              <div style={{ opacity: 0.85, marginBottom: 8 }}>{p.summary || ""}</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {(p.bullets || []).map((b: string, i: number) => <li key={i}>{b}</li>)}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
