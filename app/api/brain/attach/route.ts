import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

declare global {
  // eslint-disable-next-line no-var
  var __hx2Pool: Pool | undefined;
}

const pool =
  globalThis.__hx2Pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

globalThis.__hx2Pool = pool;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForProof(taskId: string, timeoutMs = 12000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const { rows } = await pool.query(
      `select id, received_at, task_id, payload
       from ap2_proof_events
       where task_id = $1
       order by id desc
       limit 1`,
      [taskId]
    );
    if (rows.length) return rows[0];
    await sleep(400);
  }
  return null;
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.HX2_OWNER_KEY || ""}`;
  if (!process.env.HX2_OWNER_KEY || auth !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const origin = new URL(req.url).origin;
  const body = await req.json().catch(() => ({}));
  const version = String(body.version || "v2.2");

  const enqueueRes = await fetch(`${origin}/api/ap2/task/enqueue`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: auth,
    },
    body: JSON.stringify({
      taskType: "brain.run",
      payload: {
        method: "POST",
        path: "/brain/attach",
            headers: forwardHeaders,body: { version },
      },
      callbackUrl: `${origin}/api/ap2-proof`,
    }),
  });

  const enqueueJson = await enqueueRes.json().catch(() => null);

  const taskIdRaw =
    enqueueJson?.task?.id ||
    enqueueJson?.worker?.task?.id ||
    enqueueJson?.worker?.id ||
    enqueueJson?.id;

  if (!enqueueRes.ok || !taskIdRaw) {
    return NextResponse.json(
      { ok: false, error: "enqueue_failed", details: enqueueJson },
      { status: 500 }
    );
  }

  const taskId: string = String(taskIdRaw);
  const proof = await waitForProof(taskId, 12000);

  if (!proof) {
    return NextResponse.json({
      ok: true,
      pending: true,
      taskId,
      note: "Task enqueued; proof not received within timeout",
    });
  }

  return NextResponse.json({ ok: true, taskId, proof });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { Allow: "POST, OPTIONS" } });
}






