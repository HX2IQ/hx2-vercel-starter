import { buildCapabilityPlan } from "./capability-planner";
import { buildSprintNextAction } from "./sprint-next-action";
import { buildSprintHistorySummary } from "./sprint-history-summary";
import { buildPlannerLearningSignals } from "./capability-learning";
import { buildOutcomeTelemetrySummary } from "./outcome-telemetry-summary";
import { buildOutcomeTelemetryInfluence } from "./outcome-telemetry-influence";
import { buildOutcomeTelemetryQuality } from "./outcome-telemetry-quality";
import { buildWeightedOrchestrationConfidence } from "./weighted-orchestration-confidence";
import { applyTelemetryQualityToConfidence } from "./telemetry-quality-governed-confidence";
import { buildPersistentLearningWeights } from "./persistent-learning-weights";
import { applyLearningWeightsToConfidence } from "./learning-weights-influence-confidence";
import { buildLearningWeightDrivenStrategy } from "./learning-weight-driven-strategy";
import { buildSprintNextRiskGate } from "./sprint-next-risk-gate";
import { buildSprintRiskGateActions } from "./sprint-risk-gate-actions";
import { buildSprintPowerShellActions } from "./sprint-powershell-actions";
import { buildDev2SprintPackage } from "./sprint-dev2-package";
import { buildDev2PackageSuccessSignal } from "./dev2-package-success-learning";
import { buildAdaptivePackageStrategy } from "./adaptive-dev2-package-strategy";
import { applyAdaptivePackageExecution } from "./adaptive-package-execution-modifier";
import { applyConfidenceToSprintPackage } from "./confidence-modified-sprint-package";
import { applyLearningWeightStrategyToPackage } from "./learning-weight-strategy-package-modifier";
import { buildDev2OperatorDecision } from "./dev2-operator-decision";
import { applyTelemetryInfluenceToOperatorDecision } from "./telemetry-influenced-operator-decision";
import { applyConfidenceToOperatorDecision } from "./confidence-influenced-operator-decision";
import { buildOperatorDecisionFollowthrough } from "./operator-decision-followthrough";
import { buildOrchestrationExecutionMemory } from "./orchestration-execution-memory";
import { buildOrchestrationRuntimeOutcome } from "./orchestration-runtime-outcome";
import { classifyOrchestrationExecutionContext } from "./context-aware-learning-classifier";
import { applyContextToLearningWeightStrategy } from "./context-adjusted-learning-strategy";

export function buildSprintNextPayload(message: string) {
  const plan = buildCapabilityPlan(message);

  const learningSignals = buildPlannerLearningSignals();
  const sprintHistorySummary = buildSprintHistorySummary(learningSignals);

  const persistentLearningWeights = buildPersistentLearningWeights();
  const learningWeightDrivenStrategy =
    buildLearningWeightDrivenStrategy(persistentLearningWeights);

  const outcomeTelemetrySummary = buildOutcomeTelemetrySummary();
  const outcomeTelemetryQuality =
    buildOutcomeTelemetryQuality(outcomeTelemetrySummary);
  const outcomeTelemetryInfluence =
    buildOutcomeTelemetryInfluence(outcomeTelemetrySummary);

  const rawConfidence =
    buildWeightedOrchestrationConfidence(outcomeTelemetrySummary);

  const qualityConfidence =
    applyTelemetryQualityToConfidence(rawConfidence, outcomeTelemetryQuality);

  const orchestrationConfidence =
    applyLearningWeightsToConfidence(
      qualityConfidence,
      persistentLearningWeights
    );

  const sprintAction = buildSprintNextAction(plan);

  const basePayload = {
    intent: plan.intent,
    selected_node: plan.selected_node,
    execution_mode: plan.execution_mode,
    selection_explanation: plan.selection_explanation,
    buildops_sprint_plan: plan.buildops_sprint_plan || null,
    sprint_recommendation:
      plan.buildops_sprint_plan?.recommended_focus ||
      plan.orchestration_summary,
    actionable_sprint: sprintAction,
    history_summary: sprintHistorySummary,
    persistent_learning_weights: persistentLearningWeights,
    learning_weight_driven_strategy: learningWeightDrivenStrategy,
    outcome_telemetry_summary: outcomeTelemetrySummary,
    outcome_telemetry_quality: outcomeTelemetryQuality,
    outcome_telemetry_influence: outcomeTelemetryInfluence,
    orchestration_confidence: orchestrationConfidence
  };

  const riskGate =
    buildSprintNextRiskGate(plan, sprintHistorySummary);

  const riskGateActions =
    buildSprintRiskGateActions(riskGate);

  const powershellActions =
    buildSprintPowerShellActions(riskGateActions);

  const packageSeed = {
    ...basePayload,
    risk_gate: riskGate,
    risk_gate_actions: riskGateActions,
    powershell_actions: powershellActions
  };

  const dev2SprintPackage =
    buildDev2SprintPackage(packageSeed);

  const orchestrationExecutionContext =
    classifyOrchestrationExecutionContext(dev2SprintPackage);

  const contextAdjustedLearningStrategy =
    applyContextToLearningWeightStrategy(
      learningWeightDrivenStrategy,
      orchestrationExecutionContext
    );

  const successSignal =
    buildDev2PackageSuccessSignal(dev2SprintPackage, learningSignals);

  const adaptiveStrategy =
    buildAdaptivePackageStrategy(successSignal);

  const adaptivePackage =
    applyAdaptivePackageExecution(dev2SprintPackage, adaptiveStrategy);

  const confidencePackage =
    applyConfidenceToSprintPackage(adaptivePackage, orchestrationConfidence);

  const strategyPackage =
    applyLearningWeightStrategyToPackage(
      confidencePackage,
      contextAdjustedLearningStrategy
    );

  const baseDecision =
    buildDev2OperatorDecision(strategyPackage);

  const telemetryDecision =
    applyTelemetryInfluenceToOperatorDecision(
      baseDecision,
      outcomeTelemetryInfluence
    );

  const confidenceDecision =
    applyConfidenceToOperatorDecision(
      telemetryDecision,
      orchestrationConfidence
    );

  strategyPackage.operator_decision = confidenceDecision;

  strategyPackage.operator_followthrough =
    buildOperatorDecisionFollowthrough(confidenceDecision);

  strategyPackage.execution_memory =
    buildOrchestrationExecutionMemory(strategyPackage);

  strategyPackage.runtime_outcome =
    buildOrchestrationRuntimeOutcome(strategyPackage.execution_memory);

  return {
    sprint_next: {
      ...packageSeed,
      orchestration_execution_context: orchestrationExecutionContext,
      dev2_sprint_package: strategyPackage,
      dev2_package_success_signal: successSignal,
      adaptive_package_strategy: adaptiveStrategy
    },
    planner: plan
  };
}


