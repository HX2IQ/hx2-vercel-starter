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

async function proxy(req: Request) {
  const url = new URL(req.url);
  const taskId = url.searchParams.get("taskId") || "";
  if (!taskId)
    return json(
      { status: "error", error: "missing_taskId", message: "Provide taskId as query param." },
      400
    );

  // proxy to droplet worker
  const target = `https://ap2-worker.optinodeiq.com/api/ap2/task/status?taskId=${encodeURIComponent(taskId)}`;

  const upstream = await fetch(target, { method: "GET" });
  const text = await upstream.text();

  try {
    return json(JSON.parse(text), upstream.status);
  } catch {
    return json({ ok: upstream.ok, status: upstream.status, raw: text }, upstream.status);
  }
}

export async function GET(req: Request) {
  return proxy(req);
}
