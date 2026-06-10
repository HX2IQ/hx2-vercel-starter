import { prisma } from "./kgx-lite";

function makeCombination(tags: string[]) {
  return Array.from(new Set(tags || []))
    .filter(Boolean)
    .sort()
    .join("+");
}

export async function buildKgxContextTagCombinationLearning() {
  const memories = await prisma.memoryRecord.findMany({
    where: {
      memoryType: "kgx_assembly_outcome_attribution"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 1000
  });

  const stats: Record<string, any> = {};

  for (const memory of memories) {
    const payload: any = memory.payload;
    const tags =
      Array.isArray(payload?.context_tags) &&
      payload.context_tags.length > 0
        ? payload.context_tags
        : ["uncategorized"];

    const combination = makeCombination(tags);
    const assemblyKey = payload?.assembly_key || "unknown";

    const key = `${combination}::${assemblyKey}`;

    if (!stats[key]) {
      stats[key] = {
        context_combination: combination,
        assembly_key: assemblyKey,
        outcomes: 0,
        successes: 0,
        failures: 0,
        score_total: 0,
        lastOutcome: memory.createdAt
      };
    }

    stats[key].outcomes++;

    if (payload?.success) {
      stats[key].successes++;
    }
    else {
      stats[key].failures++;
    }

    stats[key].score_total += Number(payload?.score || 0);
  }

  const ranked =
    Object.values(stats)
      .map((x: any) => {
        const successRate =
          x.outcomes > 0
            ? x.successes / x.outcomes
            : 0;

        const averageScore =
          x.outcomes > 0
            ? x.score_total / x.outcomes
            : 0;

        return {
          ...x,
          success_rate: Math.round(successRate * 100) / 100,
          average_score: Math.round(averageScore * 10) / 10,
          contextual_effectiveness_score:
            Math.round(
              (
                averageScore +
                successRate * 50 +
                x.outcomes * 3
              ) * 10
            ) / 10
        };
      })
      .sort(
        (a: any, b: any) =>
          b.contextual_effectiveness_score -
          a.contextual_effectiveness_score
      );

  const grouped: Record<string, any[]> = {};

  for (const item of ranked) {
    if (!grouped[item.context_combination]) {
      grouped[item.context_combination] = [];
    }

    grouped[item.context_combination].push(item);
  }

  const combinations =
    Object.entries(grouped)
      .map(([contextCombination, assemblies]) => {
        const best = assemblies[0] || null;

        return {
          context_combination: contextCombination,
          assembly_count: assemblies.length,
          best_assembly: best?.assembly_key || null,
          best_contextual_effectiveness_score:
            best?.contextual_effectiveness_score || 0,
          best_average_score: best?.average_score || 0,
          best_success_rate: best?.success_rate || 0,
          best_outcomes: best?.outcomes || 0
        };
      })
      .sort(
        (a: any, b: any) =>
          b.best_contextual_effectiveness_score -
          a.best_contextual_effectiveness_score
      );

  return {
    context_tag_combination_learning_active: true,
    multi_tag_combination_learning_active: true,
    combination_count: combinations.length,
    combinations
  };
}
