import { buildOrchestrationConfidenceDecay } from "./orchestration-confidence-decay";
import { applyAdaptiveRestraintToPackage } from "./adaptive-restraint-package-modifier";
import { buildAdaptiveOrchestrationRestraint } from "./adaptive-orchestration-restraint";
import { buildSprintNextLearningTelemetryStage } from "./sprint-next-learning-telemetry-stage";
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
import { buildSprintNextDecisionStage } from "./sprint-next-decision-stage";
import { buildOperatorDecisionFollowthrough } from "./operator-decision-followthrough";
import { buildOrchestrationExecutionMemory } from "./orchestration-execution-memory";
import { buildOrchestrationRuntimeOutcome } from "./orchestration-runtime-outcome";
import { classifyOrchestrationExecutionContext } from "./context-aware-learning-classifier";
import { applyContextToLearningWeightStrategy } from "./context-adjusted-learning-strategy";
import { buildSprintNextStageAudit } from "./sprint-next-stage-audit";
import { buildRecursiveVerificationResult } from "./recursive-verification-stage";
import { applyRecursiveVerificationToPackage } from "./recursive-verification-package-modifier";
import { buildVerificationTrustPosture } from "./verification-trust-posture";
import { applyVerificationEscalation } from "./verification-escalation-stage";
import { buildVerificationSynthesis } from "./verification-synthesis-stage";
import { applyVerificationSynthesisToPackage } from "./verification-synthesis-package-modifier";
import { buildOrchestrationRecoveryRecommendation } from "./orchestration-recovery-recommendation";
import { buildOrchestrationSelfAwareness } from "./orchestration-self-awareness";

export function buildSprintNextPayload(message: string) {
  const stageAudit = buildSprintNextStageAudit();

  const plan = buildCapabilityPlan(message);

  const learningTelemetry =
    buildSprintNextLearningTelemetryStage();

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

  const recursiveVerification =
    buildRecursiveVerificationResult({
      orchestrationConfidence,
      learningWeightDrivenStrategy,
      outcomeTelemetryQuality
    });

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
    orchestration_confidence: orchestrationConfidence,
    recursive_verification: recursiveVerification
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

  const verifiedPackage =
    applyRecursiveVerificationToPackage(
      strategyPackage,
      recursiveVerification
    );

  const verificationTrustPosture =
    buildVerificationTrustPosture(
      recursiveVerification,
      verifiedPackage
    );

  verifiedPackage.verification_trust_posture =
    verificationTrustPosture;

  const escalatedPackage =
    applyVerificationEscalation(
      verifiedPackage
    );

  const verificationSynthesis =
    buildVerificationSynthesis({
      orchestrationConfidence,
      outcomeTelemetryQuality,
      verificationTrustPosture,
      verificationEscalation:
        escalatedPackage?.verification_escalation,
      learningWeightDrivenStrategy:
        contextAdjustedLearningStrategy
    });

  escalatedPackage.verification_synthesis =
    verificationSynthesis;

  const synthesisPackage =
    applyVerificationSynthesisToPackage(
      escalatedPackage
    );

  const recoveryRecommendation =
    buildOrchestrationRecoveryRecommendation(
      synthesisPackage
    );

  synthesisPackage.orchestration_recovery =
    recoveryRecommendation;

  const orchestrationSelfAwareness =
    buildOrchestrationSelfAwareness(
      synthesisPackage
    );

  synthesisPackage.orchestration_self_awareness =
    orchestrationSelfAwareness;

  const orchestrationRestraint =
    buildAdaptiveOrchestrationRestraint(
      synthesisPackage
    );

  synthesisPackage.adaptive_orchestration_restraint =
    orchestrationRestraint;

  const restraintAdjustedPackage = synthesisPackage;

  const restraintAdjustedPackage =
    applyAdaptiveRestraintToPackage(
      synthesisPackage
    );

  const orchestrationConfidenceDecay =
    buildOrchestrationConfidenceDecay(
      restraintAdjustedPackage
    );

  restraintAdjustedPackage.orchestration_confidence_decay =
    orchestrationConfidenceDecay;

  const finalOperatorDecision =
    buildSprintNextDecisionStage({
      sprintPackage: restraintAdjustedPackage,
      outcomeTelemetryInfluence,
      orchestrationConfidence
    });
  restraintAdjustedPackage.operator_decision = finalOperatorDecision;

  restraintAdjustedPackage.operator_followthrough =
    buildOperatorDecisionFollowthrough(finalOperatorDecision);

  restraintAdjustedPackage.execution_memory =
    buildOrchestrationExecutionMemory(restraintAdjustedPackage);

  strategyPackage.runtime_outcome =
    buildOrchestrationRuntimeOutcome(restraintAdjustedPackage.execution_memory);

  return {
    sprint_next: {
      ...packageSeed,
      orchestration_execution_context: orchestrationExecutionContext,
      stage_audit: stageAudit,
      dev2_sprint_package: restraintAdjustedPackage,
      dev2_package_success_signal: successSignal,
      adaptive_package_strategy: adaptiveStrategy
    },
    planner: plan
  };
}






















