export const dynamic = "force-dynamic";

async function getEvents() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "https://optinodeiq.com"}/api/ap2-proof/events?limit=25`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load events: ${res.status}`);
  return res.json();
}

export default async function Page() {
  const data = await getEvents();

  return (
    <main style={{ padding: 20, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
      <h1>AP2 Proof Events</h1>
      <p>Showing latest {data?.rows?.length ?? 0}</p>
      <pre style={{ whiteSpace: "pre-wrap", background: "#0b0b0b", color: "#eaeaea", padding: 12, borderRadius: 8 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
