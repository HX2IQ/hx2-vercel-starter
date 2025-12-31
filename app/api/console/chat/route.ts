import { NextResponse } from "next/server";

function parseCommand(message: string) {
  const m = (message || "").trim();

  // allow: ap2.ping
  if (/^ap2\.ping$/i.test(m)) {
    return { mode: "SAFE", task: { type: "ping" } };
  }

  // allow: ap2.status
  if (/^ap2\.status$/i.test(m)) {
    return { mode: "SAFE", task: { type: "status" } };
  }

  // allow: ap2.help
  if (/^ap2\.help$/i.test(m)) {
    return { mode: "SAFE", task: { type: "help" } };
  }

  // allow: ap2.execute {json...}
  // example: ap2.execute {"type":"ping"}
  if (m.toLowerCase().startsWith("ap2.execute")) {
    const jsonPart = m.slice("ap2.execute".length).trim();
    if (!jsonPart) return { error: "Missing JSON. Example: ap2.execute {\"type\":\"ping\"}" };
    try {
      const task = JSON.parse(jsonPart);
      return { mode: "SAFE", task };
    } catch {
      return { error: "Bad JSON after ap2.execute" };
    }
  }

  // default: treat plain text as a task type (optional)
  // example: "ping" becomes {type:"ping"}
  if (/^[a-z0-9_\-\.]+$/i.test(m)) {
    return { mode: "SAFE", task: { type: m } };
  }

  return { error: `Unrecognized command: ${m}` };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = (body?.message ?? "").toString();

    const parsed = parseCommand(message);
    if ((parsed as any).error) {
      return NextResponse.json({ ok: false, reply: (parsed as any).error });
    }

    // forward to AP2 execute (same app, local)
    const r = await fetch(new URL("/api/ap2/execute", req.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    });

    const data = await r.json();
    const reply = data?.reply ?? JSON.stringify(data);

    return NextResponse.json({ ok: true, reply, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, reply: e?.message || "Console router error" }, { status: 500 });
  }
}











