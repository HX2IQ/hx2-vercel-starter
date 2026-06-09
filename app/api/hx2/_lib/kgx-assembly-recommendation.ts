import { buildKgxAssemblyEffectiveness } from "./kgx-assembly-effectiveness";

function parseAssemblyKey(key: string) {
  return key.split("+").map(x => x.trim()).filter(Boolean);
}

export async function buildKgxAssemblyRecommendation() {
  const effectiveness = await buildKgxAssemblyEffectiveness();
  const best = effectiveness.rankings?.[0] || null;
  const nodes = best?.assembly_key ? parseAssemblyKey(best.assembly_key) : [];

  return {
    assembly_recommendation_active: true,
    found: !!best,
    recommended_assembly: best?.assembly_key || null,
    effectiveness_score: best?.effectiveness_score || 0,
    average_score: best?.average_score || 0,
    success_rate: best?.success_rate || 0,
    outcomes: best?.outcomes || 0,
    recommended_primary: nodes[0] || null,
    recommended_challenge: nodes[1] || null,
    recommended_validation: nodes[2] || null,
    recommended_secondary: nodes[3] || null,
    reason: best ? "highest assembly effectiveness score" : "no assembly history available"
  };
}
