import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

declare global {
  // eslint-disable-next-line no-var
  var __ap2ProofPool: Pool | undefined;
}

const pool =
  globalThis.__ap2ProofPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

globalThis.__ap2ProofPool = pool;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitRaw = searchParams.get("limit") ?? "50";
  const limit = Math.max(1, Math.min(200, parseInt(limitRaw, 10) || 50));

  const { rows } = await pool.query(
    `select id, received_at, task_id, payload
     from ap2_proof_events
     order by id desc
     limit $1`,
    [limit]
  );

  return NextResponse.json({ ok: true, limit, rows });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { Allow: "GET, OPTIONS" } });
}
