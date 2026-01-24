export const dynamic = "force-dynamic";

async function getStatus() {
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/oi/status`, { cache: "no-store" });
  return r.json();
}

export default async function Page() {
  const s = await getStatus();

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>OptinodeOI — System Status</h1>

      <h3>HX2 Base API</h3>
      <pre>{JSON.stringify(s.hx2_base, null, 2)}</pre>

      <h3>AP2 Worker</h3>
      <pre>{JSON.stringify(s.ap2_worker, null, 2)}</pre>

      <h3>Queue</h3>
      <pre>{JSON.stringify(s.queue, null, 2)}</pre>

      <h3>Recent Tasks</h3>
      <pre>{JSON.stringify(s.recent, null, 2)}</pre>

      <p><a href="/oi">Back to /oi</a></p>
    </main>
  );
}
