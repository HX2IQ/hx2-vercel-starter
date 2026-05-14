type RouterScore = {
  node_id: string;
  score: number;
  reasons: string[];
  enabled: boolean;
  dry_run_only: boolean;
};

export function routeNode(input: { user_query: string }) {
  const q = String(input?.user_query || "").toLowerCase();

  const scores: RouterScore[] = [
    { node_id: "ah3", score: 0, reasons: [], enabled: true, dry_run_only: false },
    { node_id: "qa1", score: 0, reasons: [], enabled: true, dry_run_only: false },
    { node_id: "ph1", score: 0, reasons: [], enabled: true, dry_run_only: false }
  ];

  function add(nodeId: string, points: number, reason: string) {
    const row = scores.find((x) => x.node_id === nodeId);
    if (!row) return;
    row.score += points;
    row.reasons.push(reason);
  }

  if (/supplement|symptom|fasting|magnesium|creatine|nac|dizzy|dizziness|\bhealth\b|sleep|fatigue|pain/.test(q)) {
    add("ah3", 8, "Health / supplement / symptom intent detected");
  }

  if (/protocol|stack|dose|dosage|side effect|safe|safety/.test(q)) {
    add("ah3", 4, "Protocol / safety wording detected");
  }

  if (/quality|review|check|verify|audit|compare|score/.test(q)) {
    add("qa1", 3, "Quality / review intent detected");
  }

  if (/philosophy|meaning|belief|interpret|concept/.test(q)) {
    add("ph1", 4, "Philosophy / interpretation intent detected");
  }

  if (scores.every((x) => x.score === 0)) {
    add("qa1", 1, "Baseline fallback score");
  }

  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return {
    node_id: winner.node_id,
    reason: winner.reasons[0] || "Highest semantic route score",
    confidence: winner.score >= 8 ? "high" : winner.score >= 4 ? "medium" : "low",
    scores: sorted
  };
}


