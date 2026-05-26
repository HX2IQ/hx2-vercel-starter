import { buildPlannerLearningSignals } from "./capability-learning";
import { buildSprintHistorySummary } from "./sprint-history-summary";
import { buildOutcomeTelemetrySummary } from "./outcome-telemetry-summary";
import { buildOutcomeTelemetryQuality } from "./outcome-telemetry-quality";
import { buildOutcomeTelemetryInfluence } from "./outcome-telemetry-influence";
import { buildWeightedOrchestrationConfidence } from "./weighted-orchestration-confidence";
import { applyTelemetryQualityToConfidence } from "./telemetry-quality-governed-confidence";
import { buildPersistentLearningWeights } from "./persistent-learning-weights";
import { applyLearningWeightsToConfidence } from "./learning-weights-influence-confidence";
import { buildLearningWeightDrivenStrategy } from "./learning-weight-driven-strategy";

export function buildSprintNextLearningTelemetryStage() {
  const learningSignals = buildPlannerLearningSignals();
  const sprintHistorySummary = buildSprintHistorySummary(learningSignals);
  const persistentLearningWeights = buildPersistentLearningWeights();
  const learningWeightDrivenStrategy = buildLearningWeightDrivenStrategy(persistentLearningWeights);

  const outcomeTelemetrySummary = buildOutcomeTelemetrySummary();
  const outcomeTelemetryQuality = buildOutcomeTelemetryQuality(outcomeTelemetrySummary);
  const outcomeTelemetryInfluence = buildOutcomeTelemetryInfluence(outcomeTelemetrySummary);

  const rawConfidence = buildWeightedOrchestrationConfidence(outcomeTelemetrySummary);
  const qualityConfidence = applyTelemetryQualityToConfidence(rawConfidence, outcomeTelemetryQuality);
  const orchestrationConfidence = applyLearningWeightsToConfidence(
    qualityConfidence,
    persistentLearningWeights
  );

  return {
    learningSignals,
    sprintHistorySummary,
    persistentLearningWeights,
    learningWeightDrivenStrategy,
    outcomeTelemetrySummary,
    outcomeTelemetryQuality,
    outcomeTelemetryInfluence,
    orchestrationConfidence
  };
}
