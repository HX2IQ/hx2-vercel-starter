export function buildKgxConfidenceAdjustment(
  recommendations: { node: string; score: number }[],
  reinforcement: any
) {
  const reinforcementMap: Record<string, any> = {};

  for (const item of reinforcement.rankings || []) {
    reinforcementMap[item.node] = item;
  }

  const maxScore = recommendations[0]?.score || 1;

  const adjusted = recommendations.map(item => {
    const r = reinforcementMap[item.node];

    const reward = r?.reward_score || 0;
    const penalty = r?.penalty_score || 0;

    const baseConfidence = item.score / maxScore;
    const adjustedConfidence =
      baseConfidence +
      reward * 0.002 -
      penalty * 0.004;

    return {
      node: item.node,
      raw_score: item.score,
      reward_score: reward,
      penalty_score: penalty,
      adjusted_confidence:
        Math.max(
          0,
          Math.min(1, Math.round(adjustedConfidence * 100) / 100)
        )
    };
  });

  return {
    confidence_adjustment_active: true,
    adjusted
  };
}
