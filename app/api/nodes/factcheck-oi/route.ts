import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ok(data: any) {
  return NextResponse.json({ ok: true, ...data, ts: new Date().toISOString() });
}

// Optional GET for quick manual checks
export async function GET() {
  return ok({ service: "factcheck-oi", methods: ["GET", "POST"] });
}

// This is what AP2 worker needs
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  // Minimal SAFE response for smoketest (no web fetch yet)
  // Expected shape from worker: { mode, command, input:{statement,context,ts} }
  const statement = body?.input?.statement ?? null;
  const context   = body?.input?.context ?? null;

  return ok({
    service: "factcheck-oi",
    received: {
      mode: body?.mode ?? null,
      command: body?.command ?? null,
      statement,
      context
    }
  });
}
