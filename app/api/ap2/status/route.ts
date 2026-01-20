export const dynamic = "force-dynamic";

import { Pool } from "pg";

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

/**
 * DB: ap2_proof_events
 * Expected columns: id, received_at, task_id, payload
 */
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

async function latestProof(taskId: string) {
  const { rows } = await pool.query(
    `select id, received_at, task_id, payload
     from ap2_proof_events
     where task_id = $1
     order by id desc
     limit 1`,
    [taskId]
  );
  return rows?.[0] ?? null;
}

async function proxyToGateway(req: Request) {
  const url = new URL(req.url);
  const target = `https://ap2-worker.optinodeiq.com/api/ap2/status${url.search}`;

  const bearer = process.env.AP2_GATEWAY_BEARER;

  const upstream = await fetch(target, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: bearer } : {}),
    },
    body: req.method === "POST" || req.method === "PUT" ? await req.text() : undefined,
  });

  const text = await upstream.text();
  try {
    return json(JSON.parse(text), upstream.status);
  } catch {
    return json({ ok: upstream.ok, status: upstream.status, raw: text }, upstream.status);
  }
}

/**
 * POST behavior:
 * - If body contains taskId => return latest proof event for that taskId
 * - Otherwise => proxy to gateway health
 */
export async function GET(req: Request) {
  return proxyToGateway(req);
}

export async function POST(req: Request) {
  let bodyText = "";
  try {
    bodyText = await req.text();
  } catch {
    bodyText = "";
  }

  if (bodyText && bodyText.trim().length > 0) {
    try {
      const parsed = JSON.parse(bodyText);
      const taskId = (parsed?.taskId ?? "").toString().trim();
      if (taskId) {
        const proof = await latestProof(taskId);
        if (!proof) return json({ ok: false, error: "PROOF_NOT_FOUND", taskId }, 404);

        const payload = proof.payload ?? null;

        return json({
          ok: true,
          taskId,
          proof: {
            id: proof.id,
            received_at: proof.received_at,
            task_id: proof.task_id,
            payload,
          },
        });
      }
    } catch {
      // fall through to health proxy
    }
  }

  return proxyToGateway(req);
}
