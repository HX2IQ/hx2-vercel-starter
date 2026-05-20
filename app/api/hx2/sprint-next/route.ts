import { NextResponse } from "next/server";
import { buildCapabilityPlan } from "../_lib/capability-planner";
import { buildSprintNextAction } from "../_lib/sprint-next-action";
import { buildSprintHistorySummary } from "../_lib/sprint-history-summary";
import { buildSprintNextRiskGate } from "../_lib/sprint-next-risk-gate";
import { buildSprintRiskGateActions } from "../_lib/sprint-risk-gate-actions";
import { buildSprintPowerShellActions } from "../_lib/sprint-powershell-actions";
import { buildDev2SprintPackage } from "../_lib/sprint-dev2-package";
import { buildPlannerLearningSignals } from "../_lib/capability-learning";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const message =
      body?.message ||
      body?.text ||
      body?.input ||
      "Sprint next";

    const plan = buildCapabilityPlan(message);

    const sprintAction =
      buildSprintNextAction(plan);

    const learningSignals =
      buildPlannerLearningSignals();

    const sprintHistorySummary =
      buildSprintHistorySummary(
        learningSignals
      );

    const sprintRiskGate =
      buildSprintNextRiskGate(
        plan,
        sprintHistorySummary
      );

    const sprintRiskGateActions =
      buildSprintRiskGateActions(
        sprintRiskGate
      );

    const sprintPowerShellActions =
      buildSprintPowerShellActions(
        sprintRiskGateActions
      );

    const sprintNextPayload = {
      intent: plan.intent,
      selected_node: plan.selected_node,
      execution_mode: plan.execution_mode,
      selection_explanation: plan.selection_explanation,
      buildops_sprint_plan: plan.buildops_sprint_plan || null,
      sprint_recommendation:
        plan.buildops_sprint_plan?.recommended_focus ||
        plan.orchestration_summary,
      actionable_sprint:
        sprintAction,
      history_summary:
        sprintHistorySummary,
      risk_gate:
        sprintRiskGate,
      risk_gate_actions:
        sprintRiskGateActions,
      powershell_actions:
        sprintPowerShellActions
    };

    const dev2SprintPackage =
      buildDev2SprintPackage(sprintNextPayload);

    return NextResponse.json({
      ok: true,
      request: message,
      sprint_next: {
        ...sprintNextPayload,
        dev2_sprint_package:
          dev2SprintPackage
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







