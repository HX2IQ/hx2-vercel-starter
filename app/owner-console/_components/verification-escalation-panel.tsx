export function VerificationEscalationPanel({
  escalation
}: {
  escalation?: any;
}) {
  if (!escalation) return null;

  return (
    <div className="mt-4 rounded-lg border border-red-800 bg-slate-900 p-3 text-sm">
      <div className="font-semibold text-white">Verification Escalation</div>
      <div className="mt-2 text-slate-300">Escalated: {escalation?.escalated ? "true" : "false"}</div>
      <div className="mt-1 text-slate-300">Action: {escalation?.escalation_action || "unknown"}</div>
      <div className="mt-1 text-slate-300">Reason: {escalation?.escalation_reason || "unknown"}</div>
    </div>
  );
}
