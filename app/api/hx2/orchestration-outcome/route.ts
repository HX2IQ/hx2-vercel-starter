import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const execution_id =
      body?.execution_id || "unknown";

    const runtime_status =
      body?.runtime_status || "pending";

    const completed_guards =
      Array.isArray(body?.completed_guards)
        ? body.completed_guards
        : [];

    return NextResponse.json({
      ok: true,
      recorded_outcome: {
        execution_id,
        runtime_status,
        completed_guards,
        completion_timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || "orchestration outcome record failure"
    });
  }
}
