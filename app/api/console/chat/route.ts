import { NextResponse } from "next/server";

function safeJsonParse(input: string): { ok: true; value: any } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch {
    return { ok: false };
  }
}

export async function POST(req: Request) {
  const { message } = await req.json().catch(() => ({ message: "" }));
  const text = String(message || "").trim();

  if (!text || text.toLowerCase() === "help") {
    return NextResponse.json({
      reply:
        "Send JSON to enqueue AP2 tasks. Example: {\"task\":\"ping\",\"mode\":\"SAFE\"} or {\"task\":\"scaffold.execute\",\"mode\":\"SAFE\",\"blueprint_name\":\"console.ui.v1\"}."
    });
  }

  // If user typed JSON, treat it as an AP2 task enqueue payload
  const parsed = safeJsonParse(text);
  if (!parsed.ok || typeof parsed.value !== "object" || parsed.value === null) {
    return NextResponse.json({
      reply:
        "I only execute JSON right now. Paste a JSON object like {\"task\":\"ping\",\"mode\":\"SAFE\"}."
    });
  }

  const payload = parsed.value;

  // Force SAFE if missing (keeps this IP-firewall compliant)
  if (!payload.mode) payload.mode = "SAFE";

  const r = await fetch(${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/ap2/task/enqueue, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: Bearer 
    },
    body: JSON.stringify(payload)
  });

  const data = await r.json().catch(() => ({}));
  return NextResponse.json({ reply: JSON.stringify(data, null, 2), ok: r.ok, status: r.status });
}
