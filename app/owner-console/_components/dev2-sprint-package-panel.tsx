export function Dev2SprintPackagePanel({
  pkg
}: {
  pkg?: any;
}) {
  if (!pkg) return null;

  const commands = pkg?.commands || [];
  const files = pkg?.files_to_touch || [];
  const guards = pkg?.expected_guards || [];
  const phases = pkg?.execution_phases || [];
  const copyReadyPowerShell = pkg?.copy_ready_powershell || [];
  const successSignal = pkg?.dev2_package_success_signal || null;
  const adaptiveStrategy = pkg?.adaptive_package_strategy || null;
  const adaptiveAudit = pkg?.adaptive_modification_audit || null;
  const operatorDecision = pkg?.operator_decision || null;

  return (
    <div className="mt-4 rounded-xl border border-emerald-800 bg-slate-950 p-4">
      <div className="text-sm font-semibold text-white">DEV2 Sprint Package</div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm">
          <div className="text-slate-500">Feature</div>
          <div className="mt-1 text-white">{pkg.feature_name || "unknown"}</div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm">
          <div className="text-slate-500">Category</div>
          <div className="mt-1 text-white">{pkg.category || "unknown"}</div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm">
          <div className="text-slate-500">Risk Gate</div>
          <div className="mt-1 text-white">{pkg.risk_gate || "unknown"}</div>
        </div>
      </div>

      {operatorDecision ? (
        <div className="mt-4 rounded-lg border border-amber-800 bg-slate-900 p-3 text-sm">
          <div className="font-semibold text-white">Operator Decision</div>
          <div className="mt-2 text-slate-300">Decision: {operatorDecision?.decision || "unknown"}</div>
          <div className="mt-1 text-slate-300">Reason: {operatorDecision?.reason || "unknown"}</div>
          <div className="mt-1 text-slate-300">Message: {operatorDecision?.operator_message || "unknown"}</div>
          <div className="mt-1 text-slate-300">Telemetry Override: {operatorDecision?.telemetry_override ? "true" : "false"}</div>
          <div className="mt-1 text-slate-300">Confidence Override: {operatorDecision?.confidence_override ? "true" : "false"}</div>
          <div className="mt-1 text-slate-300">Confidence Band: {operatorDecision?.confidence_band || "unknown"}</div>
          <div className="mt-1 text-slate-300">Confidence Score: {operatorDecision?.confidence_score ?? 0}</div>
        </div>
      ) : null}

      {adaptiveAudit ? (
        <div className="mt-4 rounded-lg border border-cyan-800 bg-slate-900 p-3 text-sm">
          <div className="font-semibold text-white">Adaptive Modification Audit</div>
          <div className="mt-2 text-slate-300">Strategy: {adaptiveAudit?.strategy || "unknown"}</div>
          <div className="mt-1 text-slate-300">Modified: {(adaptiveAudit?.modified_fields || []).join(", ")}</div>
          <div className="mt-1 text-slate-300">Reason: {adaptiveAudit?.reason || "unknown"}</div>
        </div>
      ) : null}

      {adaptiveStrategy ? (
        <div className="mt-4 rounded-lg border border-cyan-800 bg-slate-900 p-3 text-sm">
          <div className="font-semibold text-white">
            Adaptive Package Strategy
          </div>

          <div className="mt-2 text-slate-300">
            Strategy: {adaptiveStrategy?.strategy || "unknown"}
          </div>

          <div className="mt-1 text-slate-300">
            Recommendation: {adaptiveStrategy?.recommendation || "unknown"}
          </div>
        </div>
      ) : null}

      {successSignal ? (
        <div className="mt-4 rounded-lg border border-emerald-800 bg-slate-900 p-3 text-sm">
          <div className="font-semibold text-white">Package Success Signal</div>
          <div className="mt-2 text-slate-300">Type: {successSignal?.package_type || "unknown"}</div>
          <div className="mt-1 text-slate-300">Success Score: {successSignal?.success_score ?? 0}</div>
        </div>
      ) : null}

      <div className="mt-4 text-sm text-slate-300">
        <div className="font-semibold text-white">Files to Touch</div>
        <ul className="mt-2 list-disc pl-5">
          {files.map((file: string) => <li key={file}>{file}</li>)}
        </ul>
      </div>

      <div className="mt-4 text-sm text-slate-300">
        <div className="font-semibold text-white">Execution Phases</div>
        <ol className="mt-2 list-decimal pl-5">
          {phases.map((phase: any) => (
            <li key={phase.phase}>
              <span className="font-semibold">{phase.phase}</span>: {phase.action}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 text-sm text-slate-300">
        <div className="font-semibold text-white">Copy-Ready PowerShell</div>
        <ol className="mt-2 list-decimal pl-5">
          {copyReadyPowerShell.map((cmd: string) => (
            <li key={cmd} className="font-mono text-xs">{cmd}</li>
          ))}
        </ol>
      </div>

      <div className="mt-4 text-sm text-slate-300">
        <div className="font-semibold text-white">Commands</div>
        <ol className="mt-2 list-decimal pl-5">
          {commands.map((cmd: string) => <li key={cmd} className="font-mono text-xs">{cmd}</li>)}
        </ol>
      </div>

      <div className="mt-4 text-sm text-slate-300">
        <div className="font-semibold text-white">Expected Guards</div>
        <ul className="mt-2 list-disc pl-5">
          {guards.map((guard: string) => <li key={guard}>{guard}</li>)}
        </ul>
      </div>

      <div className="mt-4 text-sm text-slate-400">
        Commit: {pkg.commit_message || "unknown"}
      </div>

      <div className="mt-2 text-sm text-slate-500">
        Rollback: {pkg.rollback_note || "unknown"}
      </div>
    </div>
  );
}








