import { buildKgxAssemblyEffectiveness } from "./kgx-assembly-effectiveness";

function parseAssemblyKey(key: string) {
  return key.split("+").map(x => x.trim()).filter(Boolean);
}

function passesConfidenceGate(best: any) {
  if (!best) {
    return false;
  }

  const minimumOutcomes = 2;
  const minimumSuccessRate = 0.7;
  const minimumEffectivenessScore = 80;

  return (
    Number(best.outcomes || 0) >= minimumOutcomes &&
    Number(best.success_rate || 0) >= minimumSuccessRate &&
    Number(best.effectiveness_score || 0) >= minimumEffectivenessScore
  );
}

export async function buildKgxAssemblyRecommendation() {
  const effectiveness = await buildKgxAssemblyEffectiveness();
  const best = effectiveness.rankings?.[0] || null;
  const confidenceGatePassed = passesConfidenceGate(best);

  const nodes =
    best?.assembly_key && confidenceGatePassed
      ? parseAssemblyKey(best.assembly_key)
      : [];

  return {
    assembly_recommendation_active: true,
    assembly_recommendation_confidence_gate_active: true,
    found: !!best && confidenceGatePassed,
    candidate_found: !!best,
    confidence_gate_passed: confidenceGatePassed,
    gate: {
      minimum_outcomes: 2,
      minimum_success_rate: 0.7,
      minimum_effectiveness_score: 80
    },
    recommended_assembly:
      confidenceGatePassed
        ? best?.assembly_key || null
        : null,
    candidate_assembly: best?.assembly_key || null,
    effectiveness_score: best?.effectiveness_score || 0,
    average_score: best?.average_score || 0,
    success_rate: best?.success_rate || 0,
    outcomes: best?.outcomes || 0,
    recommended_primary: nodes[0] || null,
    recommended_challenge: nodes[1] || null,
    recommended_validation: nodes[2] || null,
    recommended_secondary: nodes[3] || null,
    reason: !best
      ? "no assembly history available"
      : confidenceGatePassed
        ? "highest assembly effectiveness score passed confidence gate"
        : "candidate assembly found but confidence gate not passed"
  };
}
