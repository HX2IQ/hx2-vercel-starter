export type ChatMasterIntent =
  | "general"
  | "health"
  | "markets"
  | "legal"
  | "parenting"
  | "orchestrator"
  | "developer";

export interface ChatMasterRouteDecision {
  intent: ChatMasterIntent;
  target_node: string;
  confidence: number;
  reasoning?: string;
}

export const CHAT_MASTER_INTENTS: ChatMasterIntent[] = [
  "general",
  "health",
  "markets",
  "legal",
  "parenting",
  "orchestrator",
  "developer"
];
