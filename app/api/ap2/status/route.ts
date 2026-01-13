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
  // IMPORTANT: This must call the droplet domain, NOT optinodeiq.com (avoid loops)
  const url = new URL(req.url);
  const target = `https://ap2-worker.optinodeiq.com/api/ap2/status${url.search}`;

  const upstream = await fetch(target, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...(process.env.AP2_GATEWAY_AUTH ? { "Authorization": process.env.AP2_GATEWAY_AUTH } : {}),
    },
    // no body needed for status, but allow forward if present
    body: (req.method === "POST" || req.method === "PUT") ? await req.text() : undefined,
  });

  const text = await upstream.text();
  // If upstream returns JSON, pass-through; otherwise wrap
  try {
    const r = json(JSON.parse(text), upstream.status);
    r.headers.set("x-ap2-gateway-auth-present", process.env.AP2_GATEWAY_AUTH ? "true" : "false");
    return r;
  } catch {
    const r = json({ ok: upstream.ok, status: upstream.status, raw: text }, upstream.status);
    r.headers.set("x-ap2-gateway-auth-present", process.env.AP2_GATEWAY_AUTH ? "true" : "false");
    return r;
  }
}

export async function GET(req: Request) {
  return proxyToGateway(req);
}

export async function POST(req: Request) {
  return proxyToGateway(req);
}



