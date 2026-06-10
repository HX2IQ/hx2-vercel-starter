import { buildKgxContextualAssemblyLearning } from "./kgx-contextual-assembly-learning";

export async function buildKgxWeightedContextSimilarityLearning() {
  const learning = await buildKgxContextualAssemblyLearning();

  const tagStats: Record<string, any> = {};

  for (const item of learning.rankings || []) {
    const tag = item.context_tag || "uncategorized";

    if (!tagStats[tag]) {
      tagStats[tag] = {
        tag,
        observations: 0,
        score_total: 0,
        success_total: 0,
        outcome_total: 0
      };
    }

    tagStats[tag].observations++;
    tagStats[tag].score_total += Number(item.average_score || 0);
    tagStats[tag].success_total += Number(item.success_rate || 0);
    tagStats[tag].outcome_total += Number(item.outcomes || 0);
  }

  const weights =
    Object.values(tagStats)
      .map((x: any) => {
        const averageScore =
          x.observations > 0
            ? x.score_total / x.observations
            : 0;

        const averageSuccessRate =
          x.observations > 0
            ? x.success_total / x.observations
            : 0;

        const weight =
          Math.round(
            (
              averageScore * 0.5 +
              averageSuccessRate * 40 +
              Math.min(x.outcome_total, 10) * 2
            ) * 10
          ) / 10;

        return {
          tag: x.tag,
          observations: x.observations,
          outcome_total: x.outcome_total,
          average_score: Math.round(averageScore * 10) / 10,
          average_success_rate: Math.round(averageSuccessRate * 100) / 100,
          predictive_weight: weight
        };
      })
      .sort((a: any, b: any) => b.predictive_weight - a.predictive_weight);

  return {
    weighted_context_similarity_learning_active: true,
    tag_weight_count: weights.length,
    weights
  };
}
