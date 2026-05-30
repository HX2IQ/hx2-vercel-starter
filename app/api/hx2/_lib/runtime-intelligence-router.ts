export type RuntimeIntelligenceRoute = {
  reasoning_depth: "light" | "standard" | "deep";
  execution_mode: "fast" | "balanced" | "precision";
  cache_allowed: boolean;
  orchestration_level: "single" | "multi";
  token_budget: number;
};

export function routeRuntimeIntelligence(input: {
  complexity_score: number;
  mission_critical?: boolean;
  repeated_query?: boolean;
}): RuntimeIntelligenceRoute {

  const complexity = input.complexity_score;

  if (input.repeated_query) {
    return {
      reasoning_depth: "light",
      execution_mode: "fast",
      cache_allowed: true,
      orchestration_level: "single",
      token_budget: 1200
    };
  }

  if (input.mission_critical) {
    return {
      reasoning_depth: "deep",
      execution_mode: "precision",
      cache_allowed: false,
      orchestration_level: "multi",
      token_budget: 12000
    };
  }

  if (complexity <= 3) {
    return {
      reasoning_depth: "light",
      execution_mode: "fast",
      cache_allowed: true,
      orchestration_level: "single",
      token_budget: 1500
    };
  }

  if (complexity <= 7) {
    return {
      reasoning_depth: "standard",
      execution_mode: "balanced",
      cache_allowed: true,
      orchestration_level: "single",
      token_budget: 5000
    };
  }

  return {
    reasoning_depth: "deep",
    execution_mode: "precision",
    cache_allowed: false,
    orchestration_level: "multi",
    token_budget: 10000
  };
}
