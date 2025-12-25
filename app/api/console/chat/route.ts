import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const command = message?.toLowerCase().trim();

    let reply = "Unknown command";

    // Local command router
    switch (command) {
      case "ping":
        reply = "pong (local)";
        break;

      case "status":
        reply = "HX2 local console online";
        break;

      case "help":
        reply = "Available commands: ping, status, help";
        break;

      default:
        reply = `Unrecognized command: ${command}`;
    }

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { reply: "Command error" },
      { status: 400 }
    );
  }
}
