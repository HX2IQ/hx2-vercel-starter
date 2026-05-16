import {
  ChatMasterIntent,
  ChatMasterRouteDecision
} from "../contracts/chat-master";

export function routeChatMasterIntent(
  input: string
): ChatMasterRouteDecision {

  const text = String(input || "").toLowerCase();

  const routes: {
    intent: ChatMasterIntent;
    keywords: string[];
    target_node: string;
  }[] = [
    {
      intent: "health",
      keywords: ["health", "supplement", "symptom", "diet"],
      target_node: "ah2"
    },
    {
      intent: "markets",
      keywords: ["xrp", "crypto", "market", "stocks"],
      target_node: "x2"
    },
    {
      intent: "legal",
      keywords: ["legal", "trademark", "contract", "patent"],
      target_node: "l2"
    },
    {
      intent: "parenting",
      keywords: ["child", "school", "reading", "parent"],
      target_node: "pa2"
    },
    {
      intent: "developer",
      keywords: ["build", "typescript", "nextjs", "guard"],
      target_node: "dev2"
    }
  ];

  for (const route of routes) {
    if (route.keywords.some((k) => text.includes(k))) {
      return {
        intent: route.intent,
        target_node: route.target_node,
        confidence: 0.8,
        reasoning: `Matched keywords for ${route.intent}`
      };
    }
  }

  return {
    intent: "general",
    target_node: "hx2",
    confidence: 0.5,
    reasoning: "Fallback general routing"
  };
}
