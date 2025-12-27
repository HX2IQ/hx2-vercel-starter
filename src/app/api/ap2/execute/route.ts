import { NextResponse } from "next/server";

type Ap2ExecuteBody = {
  command?: string;
  mode?: string;
  scope?: string[]; // optional
  constraints?: {
    brainAccess?: boolean;
    allowBrainAttach?: boolean;
    logLevel?: string;
  };
  [k: string]: any;
};

export async function POST(req: Request) {
  let body: Ap2ExecuteBody = {};
  try {
    body = (await req.json()) as Ap2ExecuteBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const command = (body.command || "").toLowerCase().trim();
  const mode = (body.mode || "").toUpperCase().trim();

  // SAFE gate (basic sanity)
  if (mode && mode !== "SAFE") {
    return NextResponse.json(
      { ok: false, error: `Only SAFE mode is allowed here (got: ${mode})` },
      { status: 400 }
    );
  }
  if (body.constraints?.brainAccess === true || body.constraints?.allowBrainAttach === true) {
    return NextResponse.json(
      { ok: false, error: "brainAccess/allowBrainAttach not permitted" },
      { status: 403 }
    );
  }

  // ✅ Real command handling
  switch (command) {
    case "ping":
      return NextResponse.json({
        ok: true,
        endpoint: "ap2.execute",
        command: "ping",
        mode: "SAFE",
        status: "pong",
        runtime: {
          platform: "vercel",
          node_env: process.env.NODE_ENV || "unknown",
          region: process.env.VERCEL_REGION || "unknown",
        },
        ts: new Date().toISOString(),
      });

    case "status":
      // For now: report what we can from Vercel runtime.
      // (Real AP2 "self-build" status comes later when VPS worker + queue are wired.)
      return NextResponse.json({
        ok: true,
        endpoint: "ap2.execute",
        command: "status",
        mode: "SAFE",
        status: "online",
        note: "Vercel API layer online. VPS worker/queue not yet wired (self-build not active).",
        ts: new Date().toISOString(),
      });

    default:
      return NextResponse.json(
        {
          ok: false,
          error: `Unknown command: ${command || "(missing)"}`,
          allowed: ["ping", "status"],
        },
        { status: 400 }
      );
  }
}
