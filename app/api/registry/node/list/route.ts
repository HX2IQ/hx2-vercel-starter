export async function GET() {
  return Response.json({ ok: true, route: "registry.node.list", ts: new Date().toISOString() }, { status: 200 });
}
export async function POST() {
  return Response.json({ ok: false, error: "method_not_allowed", allow: ["GET"] }, { status: 405 });
}
