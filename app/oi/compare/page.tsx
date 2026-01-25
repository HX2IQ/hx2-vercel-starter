import CompareLeadCapture from "./CompareLeadCapture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getData() {
  try {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

    const r = await fetch(`${base}/api/retail/product-compare`, { cache: "no-store" });
    const j = await r.json().catch(() => null);
    return { ok: r.ok && !!j?.ok, status: r.status, data: j };
  } catch (e: any) {
    return { ok: false, status: 500, data: { ok: false, error: "fetch_failed", message: String(e?.message || e) } };
  }
}

export default async function Page() {
  const { ok, status, data } = await getData();

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Product Compare</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Quick, plain-English comparison. (Public demo)
      </p>

      <CompareLeadCapture />

      <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 10 }}>
          API: <code>/api/retail/product-compare</code> — Status: <b>{status}</b>
        </div>

        {!ok ? (
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}
