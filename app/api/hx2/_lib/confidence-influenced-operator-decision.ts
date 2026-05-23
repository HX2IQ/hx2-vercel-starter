export function applyConfidenceToOperatorDecision(
  operatorDecision: any,
  confidence: any
) {
  const band = confidence?.confidence_band || "low";

  const updated = {
    ...operatorDecision,
    confidence_band: band,
    confidence_score: confidence?.confidence_score ?? 0
  };

  if (band === "low") {
    return {
      ...updated,
      decision: "stabilize",
      reason: "Low orchestration confidence requires stability-first execution.",
      operator_message: "Reduce scope and require stronger verification before expansion.",
      confidence_override: true
    };
  }

  if (band === "high" && updated.decision === "proceed") {
    return {
      ...updated,
      decision: "expand",
      reason: "High orchestration confidence supports broader execution.",
      operator_message: "Proceed with expanded orchestration scope while keeping quick verification.",
      confidence_override: true
    };
  }

  return {
    ...updated,
    confidence_override: false
  };
}
