import { Pool } from "pg";

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
  receivedAt?: string;
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

declare global {
  // eslint-disable-next-line no-var
  var __hx2Ap2StatusPool: Pool | undefined;
}

const pool =
  globalThis.__hx2Ap2StatusPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

globalThis.__hx2Ap2StatusPool = pool;

function getTaskIdFromUrl(req: Request): string | null {
  const u = new URL(req.url);
  return u.searchParams.get("taskId");
}

async function getBody(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

function mapWorkerState(s: any): "PENDING" | "RUNNING" | "DONE" | "ERROR" {
  const v = String(s || "").toLowerCase();
  if (v === "completed" || v === "done" || v === "success") return "DONE";
  if (v === "failed" || v === "error") return "ERROR";
  if (v === "running" || v === "processing") return "RUNNING";
  return "PENDING";
}

async function latestProof(taskId: string) {
  const { rows } = await pool.query(
    `select id, received_at, task_id, payload
     from ap2_proof_events
     where task_id = $1
     order by id desc
     limit 1`,
    [taskId]
  );
  return rows[0] || null;
}

async function writeProof(taskId: string, payload: any) {
  const { rows } = await pool.query(
    `insert into ap2_proof_events (task_id, payload)
     values ($1, $2::jsonb)
     returning id, received_at`,
    [taskId, JSON.stringify(payload ?? {})]
  );
  return rows[0];
}

async function readStatus(taskId: string): Promise<StatusResp> {
  const p = await latestProof(taskId);
  if (!p) return { ok: true, taskId, state: "PENDING", found: false };

  const payload = p.payload ?? {};
  return {
    ok: true,
    taskId,
    found: true,
    state: mapWorkerState(payload?.state),
    result: payload?.result ?? null,
    error: payload?.error ?? null,
    receivedAt: p.received_at,
  };
}

export async function GET(req: Request) {
  const taskId = getTaskIdFromUrl(req);
  if (!taskId) return json({ ok: false, error: "missing_taskId", message: "Provide taskId." }, 400);

  try {
    return json(await readStatus(taskId), 200);
  } catch (err: any) {
    console.error("ap2.task.status GET crash", err);
    return json({ ok: false, error: "internal_error", message: String(err?.message ?? err) }, 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await getBody(req);
    const taskId = body?.taskId ?? getTaskIdFromUrl(req);
    if (!taskId) return json({ ok: false, error: "missing_taskId", message: "Provide taskId." }, 400);

    // If this looks like a worker callback, persist it.
    // Worker posts: { taskId, taskType, state: "completed"/"failed", result|error }
    if (body && typeof body === "object" && "state" in body) {
      const saved = await writeProof(taskId, body);
      return json({ ok: true, stored: true, taskId, receivedAt: saved.received_at }, 200);
    }

    // Otherwise, treat POST like a status read
    return json(await readStatus(taskId), 200);
  } catch (err: any) {
    console.error("ap2.task.status POST crash", err);
    return json({ ok: false, error: "internal_error", message: String(err?.message ?? err) }, 500);
  }
}
