import { headers } from "next/headers";

export const metadata = {
  alternates: { canonical: "/oi/status" },
  openGraph: { url: "https://optinodeiq.com/oi/status" },
};

export const dynamic = "force-dynamic";

function getBaseUrl() {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const proto = h.get("x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : "";
}

async function getStatus() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || getBaseUrl();
  const url = `${base}/api/oi/status`;
  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

export default async function Page() {
  const s = await getStatus();

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>OptinodeOI — System Status</h1>

      {!s.ok ? (
        <>
          <p><b>Error:</b> {s.status}</p>
          <pre>{JSON.stringify(s.data, null, 2)}</pre>
        </>
      ) : (
        <>
          <h3>HX2 Base API</h3>
          <pre>{JSON.stringify(s.data.hx2_base, null, 2)}</pre>

          <h3>AP2 Worker</h3>
          <pre>{JSON.stringify(s.data.ap2_worker, null, 2)}</pre>

          <h3>Queue</h3>
          <pre>{JSON.stringify(s.data.queue, null, 2)}</pre>

          <h3>Recent Tasks</h3>
          <pre>{JSON.stringify(s.data.recent, null, 2)}</pre>
        </>
      )}

      <p><a href="/oi">Back to /oi</a></p>
    </main>
  );
}
