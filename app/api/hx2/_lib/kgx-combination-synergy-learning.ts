import { buildKgxContextTagCombinationLearning } from "./kgx-context-tag-combination-learning";

export async function buildKgxCombinationSynergyLearning() {
  const learning =
    await buildKgxContextTagCombinationLearning();

  const rankings =
    (learning.combinations || [])
      .map((x: any) => {
        const synergyScore =
          Math.round(
            (
              x.best_average_score * 0.6 +
              x.best_success_rate * 40 +
              Math.min(x.best_outcomes, 10) * 3
            ) * 10
          ) / 10;

        return {
          ...x,
          synergy_score: synergyScore
        };
      })
      .sort(
        (a: any, b: any) =>
          b.synergy_score -
          a.synergy_score
      );

  return {
    combination_synergy_learning_active: true,
    combination_count: rankings.length,
    rankings
  };
}
