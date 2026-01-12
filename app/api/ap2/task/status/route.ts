export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StatusResp = {
  ok: boolean;
  taskId?: string;
  state?: "PENDING" | "RUNNING" | "DONE" | "ERROR";
  found?: boolean;
  result?: any;
  error?: any;
  message?: string;
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function getTaskIdFromUrl(req: Request): string | null {
  const u = new URL(req.url);
  return u.searchParams.get("taskId");
}

async function getBody(req: Request): Promise<any> {
  try { return await req.json(); } catch { return {}; }
}

/**
 * NOTE:
 * This status route MUST NOT require Postgres/Prisma in Vercel serverless.
 * The current deployment was trying to connect to 127.0.0.1:5432 and crashing.
 *
 * Plug in your real status store here (KV/Upstash/Redis/etc).
 * For now, return a safe, deterministic response.
 */
async function readStatus(taskId: string): Promise<StatusResp> {
  // TODO: Replace with real status lookup (KV/Redis/etc).
  return { ok: true, taskId, state: "PENDING", found: false };
}

export async function GET(req: Request) {
  const taskId = getTaskIdFromUrl(req);
  if (!taskId) return json({ ok: false, error: "missing_taskId", message: "Provide taskId." }, 400);
  return json(await readStatus(taskId), 200);
}

export async function POST(req: Request) {
  try {
    const body = await getBody(req);
    const taskId = body?.taskId ?? getTaskIdFromUrl(req);
    if (!taskId) return json({ ok: false, error: "missing_taskId", message: "Provide taskId." }, 400);

    // Optional: accept wait flag but don't block in serverless by default
    const resp = await readStatus(taskId);
    return json(resp, 200);
  } catch (err: any) {
    console.error("ap2.task.status crash", err);
    return json({ ok: false, error: "internal_error", message: String(err?.message ?? err) }, 500);
  }
}
