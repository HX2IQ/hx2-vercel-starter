export const dynamic = "force-dynamic";

async function getData() {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://optinodeiq.com");

  const r = await fetch(`${base}/api/retail/product-compare`, { cache: "no-store" });
  const j = await r.json().catch(() => null);
  return { ok: r.ok, status: r.status, data: j };
}

export default async function ComparePage() {
  const { ok, status, data } = await getData();

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Product Compare</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Quick, plain-English comparison. (Public demo)
      </p>

      {!ok ? (
        <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
          <b>API error</b>
          <div>Status: {status}</div>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {(data?.products || []).map((p: any) => (
            <div key={p.key} style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <h2 style={{ fontSize: 18, margin: 0 }}>{p.name}</h2>
                <span style={{ fontSize: 12, opacity: 0.7 }}>{p.category || ""}</span>
              </div>

              {p.one_liner ? <p style={{ marginTop: 10, marginBottom: 10 }}>{p.one_liner}</p> : null}

              {Array.isArray(p.pros) && p.pros.length ? (
                <>
                  <div style={{ fontWeight: 600, marginTop: 10 }}>Pros</div>
                  <ul style={{ marginTop: 6 }}>
                    {p.pros.map((x: string, i: number) => <li key={i}>{x}</li>)}
                  </ul>
                </>
              ) : null}

              {Array.isArray(p.cons) && p.cons.length ? (
                <>
                  <div style={{ fontWeight: 600, marginTop: 10 }}>Cons</div>
                  <ul style={{ marginTop: 6 }}>
                    {p.cons.map((x: string, i: number) => <li key={i}>{x}</li>)}
                  </ul>
                </>
              ) : null}

              {p.best_for ? (
                <p style={{ marginTop: 10, opacity: 0.9 }}>
                  <b>Best for:</b> {p.best_for}
                </p>
              ) : null}
            </div>
          ))}

          <div style={{ padding: 16, border: "1px dashed #bbb", borderRadius: 12 }}>
            <b>Next:</b> Add “Email me the best choice” lead capture right on this page.
          </div>
        </div>
      )}
    </main>
  );
}
