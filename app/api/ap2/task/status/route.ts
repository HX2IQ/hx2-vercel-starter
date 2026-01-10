import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

declare global {
  // eslint-disable-next-line no-var
  var __hx2TaskStatusPool: Pool | undefined;
}

const pool =
  globalThis.__hx2TaskStatusPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

globalThis.__hx2TaskStatusPool = pool;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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
  return rows.length ? rows[0] : null;
}

async function waitForProof(taskId: string, timeoutMs = 12000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const row = await latestProof(taskId);
    if (row) return row;
    await sleep(400);
  }
  return null;
}

function authOk(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.HX2_API_KEY || ""}`;
  return !!process.env.HX2_API_KEY && auth === expected;
}

async function handle(taskId: string, wait: boolean) {
  if (!taskId) {
    return NextResponse.json(
      { ok: false, status: 400, error: "missing_taskId", message: "Provide taskId." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const proof = wait ? await waitForProof(taskId, 12000) : await latestProof(taskId);

  if (!proof) {
    return NextResponse.json(
      { ok: true, taskId, state: "PENDING", found: false },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    { ok: true, taskId, state: "DONE", found: true, proof },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(req: NextRequest) {
  if (!authOk(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const taskId = url.searchParams.get("taskId") || "";
  const wait = (url.searchParams.get("wait") || "") === "1";
  return handle(taskId, wait);
}

export async function POST(req: NextRequest) {
  if (!authOk(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const taskId = body?.taskId || body?.id || body?.task_id || "";
  const wait = !!body?.wait;
  return handle(taskId, wait);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { Allow: "GET, POST, OPTIONS" },
  });
}
