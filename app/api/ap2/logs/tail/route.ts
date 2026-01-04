export const dynamic = "force-dynamic";

function resp(text: string, status = 200) {
  return new Response(text, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lines = url.searchParams.get("lines") ?? "80";
  const target = `https://ap2-worker.optinodeiq.com/api/ap2/logs/tail?lines=${encodeURIComponent(lines)}`;

  const r = await fetch(target, { method: "GET" });
  const t = await r.text();
  return resp(t, r.status);
}
