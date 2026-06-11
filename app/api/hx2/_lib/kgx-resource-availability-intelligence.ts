import { buildKgxResourceRequirementIntelligence } from "./kgx-resource-requirement-intelligence";

export async function buildKgxResourceAvailabilityIntelligence() {
  const requirements =
    await buildKgxResourceRequirementIntelligence();

  const availableUnits = 10;

  return {
    resource_availability_intelligence_active: true,
    resource_units_available: availableUnits,
    resource_units_required:
      requirements.resource_units_required,
    resource_surplus:
      availableUnits -
      requirements.resource_units_required
  };
}
