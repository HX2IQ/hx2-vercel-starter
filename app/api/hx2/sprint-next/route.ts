import { NextResponse } from "next/server";
import { buildSprintNextPayload } from "../_lib/sprint-next-composition";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const message =
      body?.message ||
      body?.text ||
      body?.input ||
      "Sprint next";

    const payload = buildSprintNextPayload(message);

    return NextResponse.json({
      ok: true,
      request: message,
      ...payload
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || "sprint-next planner failure"
    });
  }
}
