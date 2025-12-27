import { NextRequest, NextResponse } from "next/server";
import { taskRouter } from "@/lib/ap2/taskRouter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await taskRouter(body);
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "AP2 execute failed" },
      { status: 500 }
    );
  }
}
