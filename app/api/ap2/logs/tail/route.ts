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

async function proxy(req: Request) {
  const url = new URL(req.url);
  const target = `https://ap2-worker.optinodeiq.com/api/ap2/logs/tail${url.search}`;

  const upstream = await fetch(target, { method: "GET" });
  const text = await upstream.text();
  return plain(text, upstream.status);
}

export async function GET(req: Request) {
  return proxy(req);
}
