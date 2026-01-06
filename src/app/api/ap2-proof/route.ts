import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET() {
  return NextResponse.json({ ok: true, service: "ap2-proof", ts: new Date().toISOString() });
}

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));
    const taskId =
      payload?.task?.id ||
      payload?.task_id ||
      payload?.id ||
      payload?.taskId ||
      null;

    const headersObj: Record<string, string> = {};
    req.headers.forEach((v, k) => (headersObj[k] = v));

    await pool.query(
      `insert into ap2_proof_events(task_id, payload, headers)
       values ($1, $2::jsonb, $3::jsonb)`,
      [taskId, JSON.stringify(payload), JSON.stringify(headersObj)]
    );

    return NextResponse.json({ ok: true, stored: true, taskId });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
