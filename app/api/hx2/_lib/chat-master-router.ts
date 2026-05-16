import {
  ChatMasterIntent,
  ChatMasterRouteDecision
} from "../contracts/chat-master";

import {
  CHAT_MASTER_EXECUTION_MAP
} from "../contracts/chat-master-execution-map";

import {
  CHAT_MASTER_KEYWORDS
} from "../contracts/chat-master-keywords";

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
      keywords: CHAT_MASTER_KEYWORDS.health,
      target_node: CHAT_MASTER_EXECUTION_MAP.health.node
    },
    {
      intent: "markets",
      keywords: CHAT_MASTER_KEYWORDS.markets,
      target_node: CHAT_MASTER_EXECUTION_MAP.markets.node
    },
    {
      intent: "legal",
      keywords: CHAT_MASTER_KEYWORDS.legal,
      target_node: CHAT_MASTER_EXECUTION_MAP.legal.node
    },
    {
      intent: "parenting",
      keywords: CHAT_MASTER_KEYWORDS.parenting,
      target_node: CHAT_MASTER_EXECUTION_MAP.parenting.node
    },
    {
      intent: "developer",
      keywords: CHAT_MASTER_KEYWORDS.developer,
      target_node: CHAT_MASTER_EXECUTION_MAP.developer.node
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
    target_node: CHAT_MASTER_EXECUTION_MAP.general.node,
    confidence: 0.5,
    reasoning: "Fallback general routing"
  };
}
