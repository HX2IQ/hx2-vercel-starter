import { buildKgxContextualAssemblyLearning } from "./kgx-contextual-assembly-learning";

function tagCombination(tags: string[]) {
  return Array.from(new Set(tags || []))
    .filter(Boolean)
    .sort()
    .join("+");
}

export async function buildKgxContextTagCombinationLearning() {
  const learning = await buildKgxContextualAssemblyLearning();

  const stats: Record<string, any> = {};

  for (const item of learning.rankings || []) {
    const combo = tagCombination([item.context_tag]);

    if (!stats[combo]) {
      stats[combo] = {
        context_combination: combo,
        assemblies: []
      };
    }

    stats[combo].assemblies.push(item);
  }

  const combinations =
    Object.values(stats).map((x: any) => {
      const best =
        x.assemblies.sort(
          (a: any, b: any) =>
            b.contextual_effectiveness_score -
            a.contextual_effectiveness_score
        )[0] || null;

      return {
        context_combination: x.context_combination,
        assembly_count: x.assemblies.length,
        best_assembly: best?.assembly_key || null,
        best_contextual_effectiveness_score:
          best?.contextual_effectiveness_score || 0,
        best_average_score: best?.average_score || 0,
        best_success_rate: best?.success_rate || 0,
        best_outcomes: best?.outcomes || 0
      };
    });

  return {
    context_tag_combination_learning_active: true,
    combination_count: combinations.length,
    combinations
  };
}
