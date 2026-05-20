type Audit = {
  base_score?: number;
  usage_boost?: number;
  quality_boost?: number;
  success_boost?: number;
  stability_boost?: number;
  confidence_penalty?: number;
  governance_penalty?: number;
  negative_learning_penalty?: number;
  total_boost?: number;
};

export function AdaptiveScoreAudit({
  audit
}: {
  audit?: Audit;
}) {
  if (!audit) {
    return null;
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Adaptive Score Audit
      </div>

      <div className="mt-2 grid gap-2 text-xs text-slate-400 md:grid-cols-2">
        <div>Base: {audit.base_score ?? 0}</div>
        <div>Usage: {audit.usage_boost ?? 0}</div>
        <div>Quality: {audit.quality_boost ?? 0}</div>
        <div>Success: {audit.success_boost ?? 0}</div>
        <div>Stability: {audit.stability_boost ?? 0}</div>
        <div>Confidence Penalty: {audit.confidence_penalty ?? 0}</div>
        <div>Governance Penalty: {audit.governance_penalty ?? 0}</div>
        <div>Negative Learning Penalty: {audit.negative_learning_penalty ?? 0}</div>
        <div>Total Boost: {audit.total_boost ?? 0}</div>
      </div>
    </div>
  );
}
