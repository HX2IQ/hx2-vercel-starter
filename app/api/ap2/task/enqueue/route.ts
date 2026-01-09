import { requireHx2Auth } from "../../_lib/auth";
export const dynamic = "force-dynamic";

const ALLOWED_TASKS = new Set([
  "ping",
  "scaffold.execute",
  "registry.node.install",
  "diagnostics.run"
]);

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

  // CRITICAL: proxy to droplet domain to avoid loops
  const target = `https://ap2-worker.optinodeiq.com/api/ap2/task/enqueue${url.search}`;

  const bodyText = await req.text();

  const upstream = await fetch(target, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: bodyText,
  });

  const text = await upstream.text();
  try {
    return json(JSON.parse(text), upstream.status);
  } catch {
    return json({ ok: upstream.ok, status: upstream.status, raw: text }, upstream.status);
  }
}

export async function POST(req: Request) {
  const deny = requireHx2Auth(req);
  if (deny) return deny;

  const body = await req.clone().json().catch(() => null);
  if (!body?.taskType || !ALLOWED_TASKS.has(body.taskType)) {
    return new Response(
      JSON.stringify({ ok: false, error: "INVALID_TASK_TYPE" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  return proxy(req);
}
return proxy(req);
}

// optional: if someone hits it by accident
export async function GET() {
  return json({ ok: false, error: "Use POST" }, 405);
}



