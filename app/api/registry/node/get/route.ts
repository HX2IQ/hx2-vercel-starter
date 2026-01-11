import { kv } from "@vercel/kv";
import { assertAuth } from "@/app/api/_lib/auth";

export async function GET(req: Request) {
  const a = assertAuth(req);
  if (!a.ok) return Response.json(a, { status: a.status });

  const url = new URL(req.url);
  const id = (url.searchParams.get("id") || "").trim();
  if (!id) return Response.json({ ok: false, error: "missing_id" }, { status: 400 });

  const key = `registry:node:${id}`;
  const node = await kv.get(key);

  if (!node) return Response.json({ ok: false, error: "not_found", id }, { status: 404 });

  return Response.json({ ok: true, id, node }, { status: 200 });
}

export async function POST() {
  return Response.json({ ok: false, error: "method_not_allowed", allow: ["GET"] }, { status: 405 });
}
