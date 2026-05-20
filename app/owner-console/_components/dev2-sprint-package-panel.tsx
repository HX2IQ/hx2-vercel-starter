export function Dev2SprintPackagePanel({
  pkg
}: {
  pkg?: any;
}) {
  if (!pkg) return null;

  const commands = pkg?.commands || [];
  const files = pkg?.files_to_touch || [];
  const guards = pkg?.expected_guards || [];

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

      <div className="mt-4 text-sm text-slate-300">
        <div className="font-semibold text-white">Files to Touch</div>
        <ul className="mt-2 list-disc pl-5">
          {files.map((file: string) => <li key={file}>{file}</li>)}
        </ul>
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
