export function applyContextToLearningWeightStrategy(
  strategy: any,
  context: string
) {
  const updated = {
    ...strategy,
    context_adjustment_applied: true,
    context
  };

  if (context === "verification_heavy") {
    return {
      ...updated,
      verification_intensity: "high",
      scope_preference: "isolated",
      strategy_reason:
        `${strategy?.strategy_reason || "Base strategy applied."} Context requires stronger verification.`
    };
  }

  if (context === "stability_sensitive") {
    return {
      ...updated,
      orchestration_posture: "stability_first",
      verification_intensity: "high",
      scope_preference: "isolated",
      strategy_reason:
        `${strategy?.strategy_reason || "Base strategy applied."} Context is stability-sensitive.`
    };
  }

  if (context === "expansion_safe") {
    return {
      ...updated,
      orchestration_posture: "expansion_first",
      scope_preference: "expanded",
      strategy_reason:
        `${strategy?.strategy_reason || "Base strategy applied."} Context supports expansion.`
    };
  }

  return updated;
}
