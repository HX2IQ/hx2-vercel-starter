import { buildKgxContextualAssemblyLearning } from "./kgx-contextual-assembly-learning";
import { buildKgxContextTags } from "./kgx-context-tags";

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

  const best = matched[0] || null;

  const nodes =
    best?.assembly_key
      ? best.assembly_key.split("+").map((x: string) => x.trim()).filter(Boolean)
      : [];

  return {
    contextual_assembly_recommendation_active: true,
    request: requestText,
    context_tags: context.tags,
    found: !!best,
    recommended_context_tag: best?.context_tag || null,
    recommended_assembly: best?.assembly_key || null,
    contextual_effectiveness_score: best?.contextual_effectiveness_score || 0,
    average_score: best?.average_score || 0,
    success_rate: best?.success_rate || 0,
    outcomes: best?.outcomes || 0,
    recommended_primary: nodes[0] || null,
    recommended_challenge: nodes[1] || null,
    recommended_validation: nodes[2] || null,
    recommended_secondary: nodes[3] || null,
    reason: best
      ? "highest contextual assembly effectiveness score for matched request tag"
      : "no contextual assembly history matched request tags"
  };
}
