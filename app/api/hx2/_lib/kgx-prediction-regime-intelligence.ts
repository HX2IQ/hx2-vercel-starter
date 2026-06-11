import { prisma } from "./kgx-lite";

function detectRegime(payload: any) {
  const tags =
    Array.isArray(payload?.context_tags)
      ? payload.context_tags
      : [];

  if (tags.includes("travel") || tags.includes("cruise")) {
    return "travel";
  }

  if (tags.includes("finance") || tags.includes("crypto")) {
    return "finance";
  }

  if (tags.includes("coding") || tags.includes("dev")) {
    return "coding";
  }

  if (tags.includes("marketing") || tags.includes("sales")) {
    return "marketing";
  }

  return "general";
}

export async function buildKgxPredictionRegimeIntelligence() {
  const memories = await prisma.memoryRecord.findMany({
    where: {
      memoryType: "kgx_pipeline_outcome"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 1000
  });

  const regimes: Record<string, any> = {};

  for (const memory of memories) {
    const payload: any = memory.payload || {};
    const regime = detectRegime(payload);

    if (!regimes[regime]) {
      regimes[regime] = {
        regime,
        outcomes: 0,
        successes: 0,
        failures: 0,
        score_total: 0
      };
    }

    regimes[regime].outcomes++;

    if (payload.success) {
      regimes[regime].successes++;
    } else {
      regimes[regime].failures++;
    }

    regimes[regime].score_total += Number(payload.score || 0);
  }

  const rankings =
    Object.values(regimes)
      .map((x: any) => {
        const successRate =
          x.outcomes > 0 ? x.successes / x.outcomes : 0;

        const averageScore =
          x.outcomes > 0 ? x.score_total / x.outcomes : 0;

        const regimeScore =
          Math.round(
            (
              successRate * 60 +
              averageScore * 0.4 +
              Math.min(x.outcomes, 20)
            ) * 10
          ) / 10;

        return {
          ...x,
          success_rate: Math.round(successRate * 1000) / 1000,
          average_score: Math.round(averageScore * 10) / 10,
          regime_score: regimeScore
        };
      })
      .sort((a: any, b: any) => b.regime_score - a.regime_score);

  return {
    prediction_regime_intelligence_active: true,
    regime_count: rankings.length,
    regimes: rankings
  };
}
