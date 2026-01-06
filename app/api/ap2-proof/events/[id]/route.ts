import { NextResponse } from "next/server";
import { Pool } from "pg";
import { requireHx2Auth } from "../../../_lib/auth";

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

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const deny = requireHx2Auth(req);
  if (deny) return deny;

  const id = Number(ctx.params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `select id, received_at, task_id, payload, headers
     from ap2_proof_events
     where id = $1`,
    [id]
  );

  return NextResponse.json({ ok: true, row: rows[0] ?? null });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { Allow: "GET, OPTIONS" } });
}
