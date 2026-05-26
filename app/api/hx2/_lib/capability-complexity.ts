export type RequestComplexity = {
  level: "low" | "medium" | "high";
  score: number;
  reasons: string[];
  execution_mode: "single_node" | "multi_node" | "pipeline";
};

export function assessRequestComplexity(userRequest: string, candidateNodes: any[]): RequestComplexity {
  const text = userRequest.toLowerCase();
  const reasons: string[] = [];
  let score = 0.25;

  if (text.length > 120) {
    score += 0.2;
    reasons.push("longer request");
  }

  if (candidateNodes.length >= 3) {
    score += 0.25;
    reasons.push("multiple candidate nodes");
  }

  if (text.match(/deep dive|compare|strategy|roadmap|diagnostic|analyze|risk|plan/i)) {
    score += 0.2;
    reasons.push("analysis-heavy language");
  }

  if (text.match(/execute|build|deploy|sprint|fix|debug|guard|api/i)) {
    score += 0.15;
    reasons.push("execution/build language");
  }

  const cappedScore = Math.min(1, Number(score.toFixed(2)));

  const level =
    cappedScore >= 0.7
      ? "high"
      : cappedScore >= 0.45
      ? "medium"
      : "low";

  const executionMode =
    level === "high"
      ? "pipeline"
      : level === "medium"
      ? "multi_node"
      : "single_node";

  return {
    level,
    score: cappedScore,
    reasons,
    execution_mode: executionMode
  };
}
