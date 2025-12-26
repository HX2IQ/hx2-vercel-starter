import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const command = (message ?? "").toString().trim();

    // Local commands still work
    if (command.toLowerCase() === "ping") {
      return NextResponse.json({ reply: "pong (local)" });
    }
    if (command.toLowerCase() === "status") {
      return NextResponse.json({ reply: "HX2 local console online" });
    }
    if (command.toLowerCase() === "help") {
      return NextResponse.json({
        reply: "Local commands: ping, status, help. Anything else routes to AP2 enqueue.",
      });
    }

    // Everything else -> AP2 task enqueue (local stub for now)
    const res = await fetch("http://localhost:3000/api/ap2/task/enqueue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "SAFE",
        task: { type: "console.command", command },
      }),
    });

    const data = await res.json();

    // If your enqueue returns a note/queue_id, show it
    if (data?.queue_id) {
      return NextResponse.json({ reply: `AP2 queued: ${data.queue_id}` });
    }
    if (data?.note) {
      return NextResponse.json({ reply: data.note });
    }

    return NextResponse.json({ reply: "AP2 enqueue called (no reply payload)" });
  } catch (err: any) {
    return NextResponse.json(
      { reply: `Error: ${err?.message ?? "unknown"}` },
      { status: 500 }
    );
  }
}
