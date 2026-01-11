import { kv } from "@vercel/kv";
import { assertAuth } from "@/app/api/_lib/auth";

type NodePayload = {
  command?: string;
  mode?: string;
  node?: {
    id?: string;
    displayName?: string;
    type?: string;
    version?: string;
    owner?: boolean;
    constraints?: Record<string, unknown>;
    createdAt?: string;
  };
};

function nowISO() {
  return new Date().toISOString();
}

export async function POST(req: Request) {
  const a = assertAuth(req);
  if (!a.ok) return Response.json(a, { status: a.status });

  let body: NodePayload;
  try {
    body = await req.json();
  } catch (e: any) {
    return Response.json({ ok: false, error: "bad_json", detail: String(e?.message ?? e) }, { status: 400 });
  }

  const nodeId = body?.node?.id?.trim();
  if (!nodeId) {
    return Response.json({ ok: false, error: "missing_node_id" }, { status: 400 });
  }

  const key = `registry:node:${nodeId}`;
  const setKey = `registry:nodes`;

  const stored = {
    ...body,
    _meta: {
      installedAt: nowISO(),
      source: "registry.node.install",
    },
  };

  await kv.set(key, stored);
  await kv.sadd(setKey, nodeId);

  return Response.json(
    { ok: true, installed: true, nodeId, ts: nowISO() },
    { status: 200 }
  );
}

export async function GET() {
  return Response.json({ ok: false, error: "method_not_allowed", allow: ["POST"] }, { status: 405 });
}
