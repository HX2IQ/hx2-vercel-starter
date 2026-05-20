import { NextResponse } from "next/server";
import { buildCapabilityPlan } from "../_lib/capability-planner";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const message =
      body?.message ||
      body?.text ||
      body?.input ||
      "Sprint next";

    const plan = buildCapabilityPlan(message);

    return NextResponse.json({
      ok: true,
      request: message,
      sprint_next: {
        intent: plan.intent,
        selected_node: plan.selected_node,
        execution_mode: plan.execution_mode,
        selection_explanation: plan.selection_explanation,
        buildops_sprint_plan: plan.buildops_sprint_plan || null,
        sprint_recommendation:
          plan.buildops_sprint_plan?.recommended_focus ||
          plan.orchestration_summary
      },
      planner: plan
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || "sprint-next planner failure"
    });
  }
}
