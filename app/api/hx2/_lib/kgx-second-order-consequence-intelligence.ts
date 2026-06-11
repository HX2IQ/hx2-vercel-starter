import { buildKgxRiskScenarioIntelligence } from "./kgx-risk-scenario-intelligence";

export async function buildKgxSecondOrderConsequenceIntelligence() {
  const risk =
    await buildKgxRiskScenarioIntelligence();

  return {
    second_order_consequence_intelligence_active: true,
    consequence:
      risk.risk_score >= 50
        ? "resource_reallocation_required"
        : "incremental_growth_expected",
    risk_score: risk.risk_score
  };
}
