import { buildKgxDeepConsumptionIntegration } from "./kgx-deep-consumption-integration";
import { buildKgxFusionRecommendation } from "./kgx-fusion-recommendation";
import { buildKgxStrategicArbitrationIntelligence } from "./kgx-strategic-arbitration-intelligence";
import { buildKgxRecommendationAdjustmentEngine } from "./kgx-recommendation-adjustment-engine";
import { buildKgxSelfImprovementIntelligence } from "./kgx-self-improvement-intelligence";

export async function buildKgxUnifiedDecisionEngine() {
  const [
    integration,
    fusion,
    arbitration,
    adjustment,
    selfImprovement
  ] = await Promise.all([
    buildKgxDeepConsumptionIntegration(),
    buildKgxFusionRecommendation(),
    buildKgxStrategicArbitrationIntelligence(),
    buildKgxRecommendationAdjustmentEngine(),
    buildKgxSelfImprovementIntelligence()
  ]);

  return {
    unified_decision_engine_active: true,
    decision:
      adjustment.adjusted_recommendation ||
      fusion.recommendation,
    decision_score:
      adjustment.adjusted_score ||
      fusion.unified_strategic_score,
    arbitration_decision:
      arbitration.arbitration_decision,
    improvement_mode:
      selfImprovement.improvement_mode,
    integration,
    fusion,
    arbitration,
    adjustment,
    selfImprovement
  };
}
