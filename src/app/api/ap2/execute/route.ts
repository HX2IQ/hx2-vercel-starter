import { NextRequest, NextResponse } from "next/server";
import { routeTask } from "@/lib/ap2/taskRouter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await routeTask(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, endpoint: "ap2.execute", error: err?.message || "Execute handler failed" },
      { status: 500 }
    );
  }
}
