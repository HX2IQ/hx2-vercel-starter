export const dynamic = "force-dynamic";

async function getLatest() {
  const base =
    process.env.APP_BASE_URL ||
    process.env.BASE_URL ||
    "https://optinodeiq.com";
  const r = await fetch(`${base}/api/ap2-proof`, { cache: "no-store" });
  return r.json();
}

export default async function Page() {
  const data = await getLatest();

  return (
    <main style={{ padding: 16, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>AP2 Proof Viewer</h1>
      <p style={{ opacity: 0.8 }}>
        Shows the latest callback payload captured at <code>/api/ap2-proof</code>.
      </p>
      <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#eee", padding: 12, borderRadius: 8 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
      <p style={{ marginTop: 12 }}>
        Tip: <code>/api/ap2-proof?mode=list</code> for history (memory, capped at 50).
      </p>
    </main>
  );
}
