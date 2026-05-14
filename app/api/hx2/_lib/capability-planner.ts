export type CapabilityPlan = {
  mode: string;
  reason: string;
};

export function planCapability(userQuery: string, hints?: any): CapabilityPlan {
  const q = (userQuery || "").toLowerCase();

  if (hints?.node_hint === "ah3" || hints?.mode_hint === "healthoi") {
    return { mode: "ah3", reason: "HealthOI embedded chat hint matched AH3" };
  }

  if (q.match(/build|code|fix bug|typescript|nextjs|react|script/)) {
    return { mode: "coding", reason: "Coding / build / deployment language matched DEV2" };
  }

  if (q.match(/image|logo|poster|photo|ad creative|design/)) {
    return { mode: "image", reason: "Image intent detected" };
  }

  if (q.match(/near me|warehouse|supplier|company|business|local/)) {
    return { mode: "business", reason: "Business/local intent detected" };
  }

  if (q.match(/remind|schedule|every day|automation/)) {
    return { mode: "automation", reason: "Automation intent detected" };
  }

  if (q.match(/parenting|parent|child|kid|kids|8 year old|eight year old|homework|reading homework|hates reading|school struggle|tantrum|screen time|tutoring/)) {
    return { mode: "pa2", reason: "Parenting / child development intent matched PA2" };
  }

  if (q.match(/supplement|symptom|fasting|magnesium|health/)) {
    return { mode: "ah3", reason: "Health intent detected" };
  }

  if (q.match(/research|news|latest|search current/)) {
    return { mode: "research", reason: "Fresh information / search intent matched Research mode" };
  }

  if (q.match(/smartest move|what should i do|help me think|advice|future|decision|strategy|next move|best move|think through|roadmap|phase|drift|grand design|orchestrator|chat-master|capability planner/)) {
    return { mode: "conversation", reason: "Strategic planning / roadmap intent matched O2" };
  }

  return { mode: "general", reason: "Default general mode" };
}











