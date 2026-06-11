import { buildKgxSecondOrderConsequenceIntelligence } from "./kgx-second-order-consequence-intelligence";

export async function buildKgxAdaptivePlanIntelligence() {
  const consequence =
    await buildKgxSecondOrderConsequenceIntelligence();

  return {
    adaptive_plan_intelligence_active: true,
    adaptation:
      consequence.consequence === "resource_reallocation_required"
        ? "adjust_execution_strategy"
        : "continue_current_plan",
    consequence: consequence.consequence
  };
}
