export const dynamic = "force-dynamic";

async function getData() {
  const url =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/oi/public/nodes`
      : "http://localhost:3000/api/oi/public/nodes";

  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

function A({ href, children }: { href: string; children: any }) {
  return <a href={href} style={{ color: "inherit", textDecoration: "underline" }}>{children}</a>;
}

export default async function OiNodesPage() {
  const { ok, status, data } = await getData();
  const nodes = Array.isArray(data?.nodes) ? data.nodes : [];

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Public OI Nodes</h1>
      <p style={{ opacity: 0.85, marginTop: 0 }}>
        Live list pulled from the registry (public-safe fields only).
      </p>

      <div style={{ display: "flex", gap: 14, marginTop: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <A href="/oi/status">OI Status</A>
        <A href="/oi/compare">Product Compare</A>
        <A href="/oi/waitlist">Waitlist</A>
      </div>

      {!ok ? (
        <div>
          <b>Error:</b> {status}
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 12, opacity: 0.9 }}>
            Count: <b>{data?.count ?? nodes.length}</b>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {nodes.map((n: any) => (
              <div key={n.id} style={{ border: "1px solid rgba(255,255,255,.15)", borderRadius: 14, padding: 14 }}>
                <div style={{ fontWeight: 900, fontSize: 16 }}>{n.id}</div>
                <div style={{ opacity: 0.85, marginTop: 4 }}>
                  {n.type ? <span><b>type</b>: {n.type} &nbsp; </span> : null}
                  {n.version ? <span><b>version</b>: {n.version}</span> : null}
                </div>
                {n.description ? <div style={{ opacity: 0.85, marginTop: 8 }}>{n.description}</div> : null}
              </div>
            ))}
            {nodes.length === 0 ? (
              <div style={{ opacity: 0.8 }}>No nodes found yet.</div>
            ) : null}
          </div>
        </div>
      )}
    </main>
  );
}
