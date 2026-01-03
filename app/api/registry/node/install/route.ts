export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    // Minimal SAFE response for now (no persistence yet)
    // Next step after this: persist to KV/DB or AP2-backed repo patch.
    return Response.json({
      ok: true,
      route: "/api/registry/node/install",
      received: body?.command ?? null,
      mode: body?.mode ?? null,
      nodeId: body?.node?.id ?? null,
    }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (e: any) {
    return new Response("bad request", { status: 400 });
  }
}
