export const dynamic = "force-dynamic";

function plain(text: string, status = 200) {
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
  const target = `https://ap2-worker.optinodeiq.com/api/ap2/logs/tail${url.search}`;

  // Forward the key header if caller provided it
  const key = req.headers.get("x-ap2-log-key") || "";

  const upstream = await fetch(target, {
    method: "GET",
    headers: key ? { "x-ap2-log-key": key } : undefined,
  });

  const text = await upstream.text();
  return plain(text, upstream.status);
}
