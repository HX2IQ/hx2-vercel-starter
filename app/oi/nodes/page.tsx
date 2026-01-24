export const dynamic = "force-dynamic";

async function getNodes() {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.HX2_BASE_URL ||
    "https://optinodeiq.com";

  const res = await fetch(`${base.replace(/\/+$/, "")}/api/oi/public/nodes`, {
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, json };
}

export default async function OiNodesPage() {
  const data = await getNodes();
  const nodes = data?.json?.nodes || [];

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        OptinodeOI — Public Nodes
      </h1>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Live list of public OI/retail nodes currently installed.
      </p>

      {!data.ok ? (
        <pre style={{ padding: 16, background: "#111", color: "#eee", overflowX: "auto" }}>
          {JSON.stringify({ ok: data.ok, status: data.status, body: data.json }, null, 2)}
        </pre>
      ) : (
        <>
          <div style={{ marginBottom: 12, opacity: 0.8 }}>
            Count: <b>{nodes.length}</b>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {nodes.map((n: any) => (
              <div
                key={n.id}
                style={{
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>
                      {n.name || n.id}
                    </div>
                    <div style={{ opacity: 0.8, marginTop: 4 }}>
                      {n.description || ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", opacity: 0.85 }}>
                    <div><code>{n.id}</code></div>
                    <div style={{ marginTop: 4, fontSize: 12 }}>
                      {n.type ? `type: ${n.type}` : ""}
                      {n.version ? ` · v${n.version}` : ""}
                    </div>
                  </div>
                </div>

                {Array.isArray(n.tags) && n.tags.length > 0 ? (
                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {n.tags.map((t: any, i: number) => (
                      <span
                        key={`${n.id}_tag_${i}`}
                        style={{
                          fontSize: 12,
                          padding: "4px 8px",
                          borderRadius: 999,
                          border: "1px solid rgba(0,0,0,0.12)",
                          opacity: 0.85,
                        }}
                      >
                        {String(t)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
