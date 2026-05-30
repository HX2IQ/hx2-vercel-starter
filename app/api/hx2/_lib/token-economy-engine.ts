import type { RuntimeIntelligenceRoute } from "./runtime-intelligence-router";

export type TokenEconomyProfile = {
  token_budget: number;
  cost_pressure: "low" | "medium" | "high";
  efficiency_mode: "cached" | "balanced" | "precision";
  escalation_allowed: boolean;
  estimated_cost_units: number;
  economic_priority: "efficiency" | "balanced" | "quality";
};

export function buildTokenEconomyProfile(route: RuntimeIntelligenceRoute): TokenEconomyProfile {
  if (route.cache_allowed && route.reasoning_depth === "light") {
    return {
      token_budget: Math.min(route.token_budget, 1500),
      cost_pressure: "low",
      efficiency_mode: "cached",
      escalation_allowed: false,
      estimated_cost_units: 1,
      economic_priority: "efficiency"
    };
  }

  if (route.reasoning_depth === "deep" || route.execution_mode === "precision") {
    return {
      token_budget: route.token_budget,
      cost_pressure: "high",
      efficiency_mode: "precision",
      escalation_allowed: true,
      estimated_cost_units: 8,
      economic_priority: "quality"
    };
  }

  return {
    token_budget: route.token_budget,
    cost_pressure: "medium",
    efficiency_mode: "balanced",
    escalation_allowed: true,
      estimated_cost_units: 8,
      economic_priority: "quality"
  };
}

