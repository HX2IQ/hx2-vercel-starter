import { buildKgxOpportunityIntelligence } from "./kgx-opportunity-intelligence";

export async function buildKgxBottleneckIntelligence() {
  const opportunities =
    await buildKgxOpportunityIntelligence();

  const primary =
    opportunities.opportunities?.[0] || null;

  return {
    bottleneck_intelligence_active: true,
    primary_bottleneck:
      primary?.opportunity || null,
    bottleneck_score:
      primary?.opportunity_score || 0,
    opportunities
  };
}
