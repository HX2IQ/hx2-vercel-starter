import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mode = body?.mode || "SAFE";
    const task = body?.task || {};
    const type = task?.type || "";

    let reply = "";

    switch (type) {
      case "ping":
        reply = "pong (ap2 execute stub)";
        break;

      case "status":
        reply = "ap2 execute stub online";
        break;

      case "help":
        reply = "Available AP2 execute tasks: ping, status, help";
        break;

      default:
        reply = `AP2 does not recognize task: ${type || "(missing)"} (execute stub)`;
        break;
    }

    return NextResponse.json({
      ok: true,
      mode,
      reply,
      task,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
