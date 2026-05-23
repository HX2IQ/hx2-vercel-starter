import { NextResponse } from "next/server";
import { buildCapabilityPlan } from "../_lib/capability-planner";
import { buildSprintNextAction } from "../_lib/sprint-next-action";
import { buildSprintHistorySummary } from "../_lib/sprint-history-summary";
import { buildSprintNextRiskGate } from "../_lib/sprint-next-risk-gate";
import { buildSprintRiskGateActions } from "../_lib/sprint-risk-gate-actions";
import { buildSprintPowerShellActions } from "../_lib/sprint-powershell-actions";
import { buildDev2SprintPackage } from "../_lib/sprint-dev2-package";
import { buildDev2PackageSuccessSignal } from "../_lib/dev2-package-success-learning";
import { buildAdaptivePackageStrategy } from "../_lib/adaptive-dev2-package-strategy";
import { applyAdaptivePackageExecution } from "../_lib/adaptive-package-execution-modifier";
import { buildDev2OperatorDecision } from "../_lib/dev2-operator-decision";
import { applyTelemetryInfluenceToOperatorDecision } from "../_lib/telemetry-influenced-operator-decision";
import { applyConfidenceToOperatorDecision } from "../_lib/confidence-influenced-operator-decision";
import { applyConfidenceToSprintPackage } from "../_lib/confidence-modified-sprint-package";
import { buildOperatorDecisionFollowthrough } from "../_lib/operator-decision-followthrough";
import { buildOrchestrationExecutionMemory } from "../_lib/orchestration-execution-memory";
import { buildOutcomeTelemetryInfluence } from "../_lib/outcome-telemetry-influence";
import { buildWeightedOrchestrationConfidence } from "../_lib/weighted-orchestration-confidence";
import { applyTelemetryQualityToConfidence } from "../_lib/telemetry-quality-governed-confidence";
import { buildOutcomeTelemetrySummary } from "../_lib/outcome-telemetry-summary";
import { buildPersistentLearningWeights } from "../_lib/persistent-learning-weights";
import { buildOutcomeTelemetryQuality } from "../_lib/outcome-telemetry-quality";
import { buildOrchestrationRuntimeOutcome } from "../_lib/orchestration-runtime-outcome";
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

    const persistentLearningWeights =
      buildPersistentLearningWeights();

    const outcomeTelemetrySummary =
      buildOutcomeTelemetrySummary();

    const outcomeTelemetryQuality =
      buildOutcomeTelemetryQuality(
        outcomeTelemetrySummary
      );

    const outcomeTelemetryInfluence =
      buildOutcomeTelemetryInfluence(
        outcomeTelemetrySummary
      );

    const rawOrchestrationConfidence =
      buildWeightedOrchestrationConfidence(
        outcomeTelemetrySummary
      );

    const orchestrationConfidence =
      applyTelemetryQualityToConfidence(
        rawOrchestrationConfidence,
        outcomeTelemetryQuality
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

      persistent_learning_weights:
        persistentLearningWeights,

      outcome_telemetry_summary:
        outcomeTelemetrySummary,

      outcome_telemetry_quality:
        outcomeTelemetryQuality,

      outcome_telemetry_influence:
        outcomeTelemetryInfluence,

      orchestration_confidence:
        orchestrationConfidence,
      risk_gate:
        sprintRiskGate,
      risk_gate_actions:
        sprintRiskGateActions,
      powershell_actions:
        sprintPowerShellActions
    };

    const dev2SprintPackage =
      buildDev2SprintPackage(sprintNextPayload);

    const dev2PackageSuccessSignal =
      buildDev2PackageSuccessSignal(
        dev2SprintPackage,
        learningSignals
      );

    const adaptivePackageStrategy =
      buildAdaptivePackageStrategy(
        dev2PackageSuccessSignal
      );

    const adaptiveSprintPackage =
      applyAdaptivePackageExecution(
        dev2SprintPackage,
        adaptivePackageStrategy
      );

    const confidenceSprintPackage =
      applyConfidenceToSprintPackage(
        adaptiveSprintPackage,
        orchestrationConfidence
      );

    const dev2OperatorDecision =
      buildDev2OperatorDecision(
        adaptiveSprintPackage
      );

    const telemetryAdjustedDecision =
      applyTelemetryInfluenceToOperatorDecision(
        dev2OperatorDecision,
        outcomeTelemetryInfluence
      );

    const confidenceAdjustedDecision =
      applyConfidenceToOperatorDecision(
        telemetryAdjustedDecision,
        orchestrationConfidence
      );

    confidenceSprintPackage.operator_decision =
      confidenceAdjustedDecision;

    confidenceSprintPackage.operator_followthrough =
      buildOperatorDecisionFollowthrough(
        dev2OperatorDecision
      );

    confidenceSprintPackage.execution_memory =
      buildOrchestrationExecutionMemory(
        adaptiveSprintPackage
      );

    adaptiveSprintPackage.runtime_outcome =
      buildOrchestrationRuntimeOutcome(
        adaptiveSprintPackage.execution_memory
      );

    return NextResponse.json({
      ok: true,
      request: message,
      sprint_next: {
        ...sprintNextPayload,
        dev2_sprint_package:
          confidenceSprintPackage,

        dev2_package_success_signal:
          dev2PackageSuccessSignal,

        adaptive_package_strategy:
          adaptivePackageStrategy
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
























