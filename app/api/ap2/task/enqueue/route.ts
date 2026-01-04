export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const taskType = body.taskType ?? body.type;
    const payload = body.payload ?? {};

    if (!taskType) {
      return json({ ok: false, error: "missing taskType" }, 400);
    }

    const gateway = process.env.AP2_GATEWAY_URL;
    if (!gateway) {
      return json(
        { ok: false, error: "AP2_GATEWAY_URL not set in Vercel" },
        500
      );
    }

    const upstream = await fetch(
      `${gateway.replace(/\/$/, "")}/api/ap2/task/enqueue`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ taskType, payload }),
        cache: "no-store",
      }
    );

    const text = await upstream.text();

    return new Response(text, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ??
          "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (err: any) {
    return json(
      { ok: false, error: "proxy failed", detail: String(err) },
      500
    );
  }
}










