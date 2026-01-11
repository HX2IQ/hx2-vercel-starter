export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = (url.searchParams.get("id") || "").trim();
  return Response.json({ ok: true, route: "registry.node.get", id, ts: new Date().toISOString() }, { status: 200 });
}
export async function POST() {
  return Response.json({ ok: false, error: "method_not_allowed", allow: ["GET"] }, { status: 405 });
}
