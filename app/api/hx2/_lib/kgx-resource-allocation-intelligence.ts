import { buildKgxExecutionFeasibilityIntelligence } from "./kgx-execution-feasibility-intelligence";

export async function buildKgxResourceAllocationIntelligence() {
  const feasibility =
    await buildKgxExecutionFeasibilityIntelligence();

  return {
    resource_allocation_intelligence_active: true,
    allocation_decision:
      feasibility.feasible
        ? "allocate_resources"
        : "defer_allocation",
    feasibility_band:
      feasibility.feasibility_band
  };
}
