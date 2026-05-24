import { VerificationEscalationPanel } from "./verification-escalation-panel";
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

      {pkg?.verification_escalation ? (
        <div className="mt-4 rounded-lg border border-red-800 bg-slate-900 p-3 text-sm">
          <div className="font-semibold text-white">Verification Escalation</div>
          <div className="mt-2 text-slate-300">Escalated: {pkg.verification_escalation?.escalated ? "true" : "false"}</div>
          <div className="mt-1 text-slate-300">Action: {pkg.verification_escalation?.escalation_action || "unknown"}</div>
          <div className="mt-1 text-slate-300">Reason: {pkg.verification_escalation?.escalation_reason || "unknown"}</div>
        </div>
      ) : null}

      <VerificationEscalationPanel escalation={pkg?.verification_escalation} />

      {pkg?.verification_trust_posture ? (
        <div className="mt-4 rounded-lg border border-emerald-800 bg-slate-900 p-3 text-sm">
          <div className="font-semibold text-white">Verification Trust Posture</div>
          <div className="mt-2 text-slate-300">Posture: {pkg.verification_trust_posture?.trust_posture || "unknown"}</div>
          <div className="mt-1 text-slate-300">Reason: {pkg.verification_trust_posture?.trust_reason || "unknown"}</div>
        </div>
      ) : null}

      {pkg?.recursive_verification_audit ? (
        <div className="mt-4 rounded-lg border border-purple-800 bg-slate-900 p-3 text-sm">
          <div className="font-semibold text-white">Recursive Verification Audit</div>
          <div className="mt-2 text-slate-300">Applied: {pkg.recursive_verification_audit?.applied ? "true" : "false"}</div>
          <div className="mt-1 text-slate-300">Action: {pkg.recursive_verification_audit?.suggested_action || "unknown"}</div>
          <div className="mt-1 text-slate-300">Status: {pkg.recursive_verification_audit?.verification_status || "unknown"}</div>
          <div className="mt-1 text-slate-300">Reason: {pkg.recursive_verification_audit?.reason || "unknown"}</div>
        </div>
      ) : null}

      {pkg?.learning_weight_strategy_audit ? (
        <div className="mt-4 rounded-lg border border-cyan-800 bg-slate-900 p-3 text-sm">
          <div className="font-semibold text-white">Learning Weight Strategy Audit</div>
          <div className="mt-2 text-slate-300">Posture: {pkg.learning_weight_strategy_audit?.orchestration_posture || "unknown"}</div>
          <div className="mt-1 text-slate-300">Scope: {pkg.learning_weight_strategy_audit?.scope_preference || "unknown"}</div>
          <div className="mt-1 text-slate-300">Verification: {pkg.learning_weight_strategy_audit?.verification_intensity || "unknown"}</div>
          <div className="mt-1 text-slate-300">Reason: {pkg.learning_weight_strategy_audit?.reason || "unknown"}</div>
        </div>
      ) : null}

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
          <div className="mt-1 text-slate-300">Verification Escalation Override: {operatorDecision?.verification_escalation_override ? "true" : "false"}</div>
          <div className="mt-1 text-slate-300">Quality Override: {operatorDecision?.quality_override ? "true" : "false"}</div>
          <div className="mt-1 text-slate-300">Telemetry Quality: {operatorDecision?.telemetry_quality_band || "unknown"}</div>
          <div className="mt-1 text-slate-300">Learning Weights Applied: {operatorDecision?.learning_weights_applied ? "true" : "false"}</div>

          {operatorDecision?.learning_weight_audit ? (
            <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
              <div className="font-semibold text-white">Learning Weight Audit</div>
              <div className="mt-2 text-slate-300">Original Score: {operatorDecision.learning_weight_audit.original_score ?? 0}</div>
              <div className="mt-1 text-slate-300">Weighted Score: {operatorDecision.learning_weight_audit.weighted_score ?? 0}</div>
              <div className="mt-1 text-slate-300">Telemetry Bias: {operatorDecision.learning_weight_audit.telemetry_bias ?? 1}</div>
              <div className="mt-1 text-slate-300">Stability Bias: {operatorDecision.learning_weight_audit.stability_bias ?? 1}</div>
              <div className="mt-1 text-slate-300">Expansion Bias: {operatorDecision.learning_weight_audit.expansion_bias ?? 1}</div>
            </div>
          ) : null}
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
















