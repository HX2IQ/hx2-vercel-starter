import { buildKgxContextualAssemblyLearning } from "./kgx-contextual-assembly-learning";
import { buildKgxContextTags } from "./kgx-context-tags";

function passesContextualConfidenceGate(best: any) {
  if (!best) {
    return false;
  }

  const minimumOutcomes = 2;
  const minimumSuccessRate = 0.7;
  const minimumContextualEffectivenessScore = 80;

  return (
    Number(best.outcomes || 0) >= minimumOutcomes &&
    Number(best.success_rate || 0) >= minimumSuccessRate &&
    Number(best.contextual_effectiveness_score || 0) >= minimumContextualEffectivenessScore
  );
}

export async function buildKgxContextualAssemblyRecommendation(
  requestText: string
) {
  const context = buildKgxContextTags(requestText);
  const learning = await buildKgxContextualAssemblyLearning();

  const matched =
    (learning.rankings || [])
      .filter((x: any) =>
        context.tags.includes(x.context_tag)
      )
      .sort(
        (a: any, b: any) =>
          b.contextual_effectiveness_score -
          a.contextual_effectiveness_score
      );

  const candidate = matched[0] || null;
  const confidenceGatePassed =
    passesContextualConfidenceGate(candidate);

  const nodes =
    candidate?.assembly_key && confidenceGatePassed
      ? candidate.assembly_key.split("+").map((x: string) => x.trim()).filter(Boolean)
      : [];

  return {
    contextual_assembly_recommendation_active: true,
    contextual_assembly_confidence_gate_active: true,
    request: requestText,
    context_tags: context.tags,
    found: !!candidate && confidenceGatePassed,
    candidate_found: !!candidate,
    confidence_gate_passed: confidenceGatePassed,
    gate: {
      minimum_outcomes: 2,
      minimum_success_rate: 0.7,
      minimum_contextual_effectiveness_score: 80
    },
    recommended_context_tag:
      confidenceGatePassed
        ? candidate?.context_tag || null
        : null,
    candidate_context_tag: candidate?.context_tag || null,
    recommended_assembly:
      confidenceGatePassed
        ? candidate?.assembly_key || null
        : null,
    candidate_assembly: candidate?.assembly_key || null,
    contextual_effectiveness_score:
      candidate?.contextual_effectiveness_score || 0,
    average_score: candidate?.average_score || 0,
    success_rate: candidate?.success_rate || 0,
    outcomes: candidate?.outcomes || 0,
    recommended_primary: nodes[0] || null,
    recommended_challenge: nodes[1] || null,
    recommended_validation: nodes[2] || null,
    recommended_secondary: nodes[3] || null,
    reason: !candidate
      ? "no contextual assembly history matched request tags"
      : confidenceGatePassed
        ? "highest contextual assembly effectiveness score passed confidence gate"
        : "candidate contextual assembly found but confidence gate not passed"
  };
}
