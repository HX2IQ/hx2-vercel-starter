export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nodeId = body?.node?.id ?? body?.nodeId ?? "unknown";
    return Response.json({ ok: true, installed: true, nodeId, ts: new Date().toISOString() }, { status: 200 });
  } catch (e: any) {
    return Response.json({ ok: false, error: "bad_json", detail: String(e?.message ?? e) }, { status: 400 });
  }
}

export async function GET() {
  return Response.json({ ok: false, error: "method_not_allowed", allow: ["POST"] }, { status: 405 });
}
