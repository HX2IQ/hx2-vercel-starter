import { buildKgxContextTagCombinationLearning } from "./kgx-context-tag-combination-learning";

export async function buildKgxCombinationFailureIntelligence() {
  const learning =
    await buildKgxContextTagCombinationLearning();

  const failures =
    (learning.combinations || [])
      .map((x: any) => {
        const successRate =
          Number(x.best_success_rate || 0);

        const outcomes =
          Number(x.best_outcomes || 0);

        const failureRisk =
          Math.round(
            (
              (1 - successRate) * 100 +
              Math.max(0, 3 - outcomes) * 10
            ) * 10
          ) / 10;

        return {
          ...x,
          failure_risk_score: failureRisk
        };
      })
      .sort(
        (a: any, b: any) =>
          b.failure_risk_score -
          a.failure_risk_score
      );

  return {
    combination_failure_intelligence_active: true,
    combinations_evaluated: failures.length,
    failures
  };
}
