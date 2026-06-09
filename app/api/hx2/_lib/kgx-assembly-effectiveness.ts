import { buildKgxAssemblyLearning } from "./kgx-assembly-learning";

export async function buildKgxAssemblyEffectiveness() {
  const learning = await buildKgxAssemblyLearning();

  const rankings =
    (learning.assemblies || [])
      .map((x: any) => {
        const effectivenessScore =
          Math.round(
            (
              x.average_score +
              x.success_rate * 50 -
              x.failure_rate * 50 +
              x.outcomes * 3
            ) * 10
          ) / 10;

        return {
          ...x,
          effectiveness_score: effectivenessScore
        };
      })
      .sort(
        (a: any, b: any) =>
          b.effectiveness_score -
          a.effectiveness_score
      );

  return {
    assembly_effectiveness_active: true,
    rankings
  };
}
