import { kv } from "@vercel/kv";
import { assertAuth } from "@/app/api/_lib/auth";

export async function GET(req: Request) {
  const a = assertAuth(req);
  if (!a.ok) return Response.json(a, { status: a.status });

  const ids = (await kv.smembers("registry:nodes")) as string[] | null;
  const nodeIds = (ids ?? []).sort();
  return Response.json({ ok: true, nodeIds, count: nodeIds.length }, { status: 200 });
}

export async function POST() {
  return Response.json({ ok: false, error: "method_not_allowed", allow: ["GET"] }, { status: 405 });
}
