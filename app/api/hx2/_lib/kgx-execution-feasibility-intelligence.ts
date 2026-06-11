import { buildKgxResourceAvailabilityIntelligence } from "./kgx-resource-availability-intelligence";

export async function buildKgxExecutionFeasibilityIntelligence() {
  const availability =
    await buildKgxResourceAvailabilityIntelligence();

  const feasible =
    availability.resource_surplus >= 0;

  return {
    execution_feasibility_intelligence_active: true,
    feasible,
    resource_surplus:
      availability.resource_surplus,
    feasibility_band:
      feasible
        ? "feasible"
        : "resource_constrained"
  };
}
