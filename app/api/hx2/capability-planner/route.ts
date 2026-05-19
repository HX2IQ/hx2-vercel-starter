import { NextResponse } from "next/server";
import { buildCapabilityPlan } from "../_lib/capability-planner";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userRequest =
      body?.message ||
      body?.text ||
      body?.input ||
      "";

    const result = buildCapabilityPlan(userRequest);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || "planner failure"
    });
  }
}
