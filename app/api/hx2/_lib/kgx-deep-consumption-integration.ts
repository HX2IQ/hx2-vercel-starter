import { buildKgxAdaptivePlanIntelligence } from "./kgx-adaptive-plan-intelligence";
import { buildKgxForecastWeightedRecommendation } from "./kgx-forecast-weighted-recommendation";
import { buildKgxLearningSignalAggregator } from "./kgx-learning-signal-aggregator";
import { buildKgxOutcomeRecordingEngine } from "./kgx-outcome-recording-engine";
import { buildKgxPlanReadinessIntelligence } from "./kgx-plan-readiness-intelligence";
import { buildKgxPredictionPromotionDeltaIntelligence } from "./kgx-prediction-promotion-delta-intelligence";
import { buildKgxRegimeAwarePlanning } from "./kgx-regime-aware-planning";
import { buildKgxSelfImprovementIntelligence } from "./kgx-self-improvement-intelligence";
import { buildKgxStrategicArbitrationIntelligence } from "./kgx-strategic-arbitration-intelligence";

export async function buildKgxDeepConsumptionIntegration() {
  const [
    adaptivePlan,
    forecastWeighted,
    learningSignal,
    outcomeRecording,
    planReadiness,
    promotionDelta,
    regimeAware,
    selfImprovement,
    strategicArbitration
  ] = await Promise.all([
    buildKgxAdaptivePlanIntelligence(),
    buildKgxForecastWeightedRecommendation(),
    buildKgxLearningSignalAggregator(),
    buildKgxOutcomeRecordingEngine(),
    buildKgxPlanReadinessIntelligence(),
    buildKgxPredictionPromotionDeltaIntelligence(),
    buildKgxRegimeAwarePlanning(),
    buildKgxSelfImprovementIntelligence(),
    buildKgxStrategicArbitrationIntelligence()
  ]);

  return {
    deep_consumption_integration_active: true,
    consumed_modules: 9,
    integration_band: "phase10a",
    adaptivePlan,
    forecastWeighted,
    learningSignal,
    outcomeRecording,
    planReadiness,
    promotionDelta,
    regimeAware,
    selfImprovement,
    strategicArbitration
  };
}
