export const dynamic = "force-dynamic";

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

async function proxyToGateway(req: Request) {
  const url = new URL(req.url);
  const target = `https://ap2-worker.optinodeiq.com/api/ap2/status${url.search}`;

  const bearer = process.env.AP2_GATEWAY_BEARER;

  const upstream = await fetch(target, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { "Authorization": bearer } : {}),
    },
    body: (req.method === "POST" || req.method === "PUT") ? await req.text() : undefined,
  });

  const text = await upstream.text();
  try { return json(JSON.parse(text), upstream.status); }
  catch { return json({ ok: upstream.ok, status: upstream.status, raw: text }, upstream.status); }
}

export async function GET(req: Request)  { return proxyToGateway(req); }
export async function POST(req: Request) { return proxyToGateway(req); }
