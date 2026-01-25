export const dynamic = "force-dynamic";

async function getData() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  const url = `${base}/api/retail/product-compare`;

  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

function Card({ title, children }: { title: string; children: any }) {
  return (
    <div style={{ border: "1px solid rgba(0,0,0,.12)", borderRadius: 14, padding: 14, background: "rgba(255,255,255,.7)" }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

export default async function ComparePage() {
  const { ok, status, data } = await getData();

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Product Compare</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Public demo: pulls from <code>/api/retail/product-compare</code>
      </p>

      {!ok ? (
        <div style={{ padding: 14, borderRadius: 12, border: "1px solid rgba(0,0,0,.12)" }}>
          <b>Error:</b> API returned status {status}.<br />
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            {Array.isArray(data?.products) ? data.products.map((p: any) => (
              <Card key={p.key} title={p.name || p.key}>
                <div style={{ opacity: 0.85, marginBottom: 8 }}>{p.summary || ""}</div>
                <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.9 }}>
                  {(p.bullets || []).map((b: string, i: number) => <li key={i} style={{ marginBottom: 6 }}>{b}</li>)}
                </ul>
              </Card>
            )) : (
              <Card title="Raw Response">
                <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(data, null, 2)}</pre>
              </Card>
            )}
          </div>

          <div style={{ marginTop: 18, opacity: 0.75 }}>
            <a href="/oi/retail" style={{ textDecoration: "underline" }}>Back to OI Retail</a>
          </div>
        </>
      )}
    </main>
  );
}
