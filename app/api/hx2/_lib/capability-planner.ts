export type CapabilityPlan = {
  ok: boolean;
  user_request: string;
  intent: string;
  candidate_nodes: string[];
  execution_strategy: string;
  confidence: number;
  orchestration_summary: string;
};

function detectIntent(input: string): string {
  const text = input.toLowerCase();

  if (text.match(/health|supplement|diet|symptom|vitamin|blood/i)) {
    return "health_analysis";
  }

  if (text.match(/crypto|xrp|bitcoin|market|stocks|silver/i)) {
    return "market_analysis";
  }

  if (text.match(/marketing|seo|customer|sales|brand/i)) {
    return "marketing_strategy";
  }

  if (text.match(/travel|flight|hotel|vacation/i)) {
    return "travel_planning";
  }

  if (text.match(/parent|child|school|reading|tutor/i)) {
    return "parenting_support";
  }

  return "general_reasoning";
}

function mapNodes(intent: string): string[] {
  switch (intent) {
    case "health_analysis":
      return ["AH2", "DA2"];

    case "market_analysis":
      return ["X2", "H2", "DA2"];

    case "marketing_strategy":
      return ["K2", "DA2"];

    case "travel_planning":
      return ["TravelOI", "DA2"];

    case "parenting_support":
      return ["PA2", "DA2"];

    default:
      return ["HX2", "DA2"];
  }
}

function strategyFor(intent: string): string {
  switch (intent) {
    case "health_analysis":
      return "mechanism-first health evaluation";

    case "market_analysis":
      return "multi-node market + narrative analysis";

    case "marketing_strategy":
      return "brand and conversion optimization";

    case "travel_planning":
      return "cost/risk optimized travel orchestration";

    case "parenting_support":
      return "development-aware parenting guidance";

    default:
      return "general orchestration reasoning";
  }
}

export function buildCapabilityPlan(userRequest: string): CapabilityPlan {
  const intent = detectIntent(userRequest);
  const candidateNodes = mapNodes(intent);

  return {
    ok: true,
    user_request: userRequest,
    intent,
    candidate_nodes: candidateNodes,
    execution_strategy: strategyFor(intent),
    confidence: 0.72,
    orchestration_summary:
      `Planner selected ${candidateNodes.join(", ")} for ${intent}.`
  };
}
