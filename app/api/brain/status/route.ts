import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: Request) {
  const auth = req.headers.get("authorization") || "";
  // Expect: "Bearer <HX2_API_KEY>"
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return !!process.env.HX2_API_KEY && token === process.env.HX2_API_KEY;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // This endpoint is a SAFE stub unless/until you add a secure tunnel.
  // For now it reports Vercel-side status only (no brain internals).
  return NextResponse.json({
    ok: true,
    service: "brain.status",
    ts: new Date().toISOString(),
    note: "Proxy not yet wired to VPS brain-shell (owner-only endpoint scaffolded).",
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { Allow: "GET, OPTIONS" } });
}
