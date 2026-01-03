export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  return Response.json(
    {
      ok: true,
      route: "/api/registry/node/install",
      received: body?.command ?? null,
      mode: body?.mode ?? null,
      nodeId: body?.node?.id ?? null
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
