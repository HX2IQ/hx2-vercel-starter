export const CHAT_MASTER_EXECUTION_MAP: Record<string, {
  node: string;
  description: string;
}> = {

  general: {
    node: "hx2",
    description: "General HX2 orchestration"
  },

  health: {
    node: "ah2",
    description: "Advanced Health Intelligence"
  },

  markets: {
    node: "x2",
    description: "Markets and crypto analysis"
  },

  legal: {
    node: "l2",
    description: "Legal and trademark analysis"
  },

  parenting: {
    node: "pa2",
    description: "Parenting Intelligence"
  },

  orchestrator: {
    node: "ap2",
    description: "System orchestration"
  },

  developer: {
    node: "dev2",
    description: "Developer operations"
  }
};
