export type Qa1Input = {
  user_query?: string;
};

export type Qa1Score = {
  name: string;
  score: number;
  reason: string;
};

export type Qa1Result = {
  node_id: "qa1";
  node_label: string;
  purpose: string;
  status: "active_v1";
  query_type: "general";
  summary: string;
  composite_score: number;
  verdict: "strong" | "usable_with_caution" | "caution" | "high_caution";
  scores: Qa1Score[];
  flags: string[];
  suggestions: string[];
  confidence: "low" | "medium" | "high";
  limitations: string[];
  received_input_keys: string[];
};

function clampScore(value: number) {
  if (value < 1) return 1;
  if (value > 10) return 10;
  return Math.round(value);
}

function computeCompositeScore(scores: Qa1Score[]) {
  const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  return clampScore(avg);
}

function detectVerdict(score: number): Qa1Result["verdict"] {
  if (score >= 8) return "strong";
  if (score >= 6) return "usable_with_caution";
  if (score >= 4) return "caution";
  return "high_caution";
}

export function runQa1Analysis(input: Qa1Input): Qa1Result {
  const userQuery = (input.user_query || "").trim();

  const scores: Qa1Score[] = [
    {
      name: "Signal Clarity",
      score: 7,
      reason: "Estimates whether the prompt contains enough usable information."
    },
    {
      name: "Practical Utility",
      score: 7,
      reason: "Estimates how useful the node output can be from the current input."
    },
    {
      name: "Safety Margin",
      score: 7,
      reason: "Estimates whether the node should proceed cautiously."
    }
  ];

  const compositeScore = computeCompositeScore(scores);
  const verdict = detectVerdict(compositeScore);

  return {
    node_id: "qa1",
    node_label: "Quality Assurance Intelligence 1",
    purpose: "Run generic quality checks and structured review scoring for HX2 node outputs.",
    status: "active_v1",
    query_type: "general",
    summary: `Quality Assurance Intelligence 1 processed the request. First-pass composite score: ${compositeScore}/10 with a ${verdict.replaceAll("_", " ")} read.`,
    composite_score: compositeScore,
    verdict,
    scores,
    flags: [],
    suggestions: [
      "Add more specific input details for a sharper result."
    ],
    confidence: userQuery.length > 80 ? "medium" : "low",
    limitations: [
      "This is a generic active_v1 node template.",
      "Domain-specific logic should be added in the helper file, not the route."
    ],
    received_input_keys: Object.keys(input || {})
  };
}

