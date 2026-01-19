import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

declare global {
  // eslint-disable-next-line no-var
  var __hx2Pool: Pool | undefined;
}

function getConn() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    ""
  );
}

const conn = getConn();

const pool =
  globalThis.__hx2Pool ??
  new Pool({
    connectionString: conn,
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
  try {
    const auth = req.headers.get("authorization") || "";
    const expected = `Bearer ${process.env.HX2_API_KEY || ""}`;
    if (!process.env.HX2_API_KEY || auth !== expected) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    // Hard fail early if DB env missing in this runtime
    if (!conn) {
      return NextResponse.json(
        { ok: false, error: "missing_db_env", hint: "Set DATABASE_URL (Production) and redeploy." },
        { status: 500 }
      );
    }

    // Quick DB check so we get a useful error if Neon/network is the issue
    await pool.query("select 1 as ok");

    const origin = new URL(req.url).origin;

    const body = await req.json().catch(() => ({}));

    const enqueueRes = await fetch(`${origin}/api/ap2/task/enqueue`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: auth,
      },
      body: JSON.stringify({
        taskType: "brain.run",
        payload: body,
        callbackUrl: `${origin}/api/ap2-proof`,
      }),
    });

    const enqueueJson = await enqueueRes.json().catch(() => null);
    if (!enqueueRes.ok || !enqueueJson?.task?.id) {
      return NextResponse.json(
        { ok: false, error: "enqueue_failed", details: enqueueJson },
        { status: 500 }
      );
    }

    const taskId: string = enqueueJson.task.id;
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
  } catch (e: any) {
    console.error("brain/run error:", e);
    return NextResponse.json(
      { ok: false, error: "internal_error", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { Allow: "POST, OPTIONS" } });
}
