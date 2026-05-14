export type SaveDecision = {
  shouldSave: boolean;
  reason: "missing_primary_id" | "score_below_threshold" | "score_above_threshold";
};

export function buildSaveDecision(options: {
  hasPrimaryId: boolean;
  score: number;
  minScore: number;
}): SaveDecision {
  const { hasPrimaryId, score, minScore } = options;

  if (!hasPrimaryId) {
    return {
      shouldSave: false,
      reason: "missing_primary_id",
    };
  }

  if (Number(score || 0) < Number(minScore || 0)) {
    return {
      shouldSave: false,
      reason: "score_below_threshold",
    };
  }

  return {
    shouldSave: true,
    reason: "score_above_threshold",
  };
}
