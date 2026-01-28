import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const blueprint = String(body?.blueprint ?? body?.blueprint_name ?? body?.name ?? "console-ui");

    const Base = process.env.NEXT_PUBLIC_BASE_URL || "https://optinodeiq.com";
    const HX2  = process.env.HX2_API_KEY;

    if (!HX2) {
      return NextResponse.json({ ok: false, error: "HX2_API_KEY not set on Vercel" }, { status: 500 });
    }

    // enqueue AP2 task: scaffold.execute
    const enqueueRes = await fetch(`${Base}/api/ap2/task/enqueue`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${HX2}`,
      },
      body: JSON.stringify({
        taskType: "scaffold.execute",
        mode: "SAFE",
        payload: {
          blueprint_name: blueprint
        }
      }),
    });

    const enq = await enqueueRes.json();
    const taskId = enq?.worker?.task?.id;

    if (!taskId) {
      return NextResponse.json({ ok: false, error: "No taskId returned", enq }, { status: 500 });
    }

    return NextResponse.json({ ok: true, taskId, blueprint });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
