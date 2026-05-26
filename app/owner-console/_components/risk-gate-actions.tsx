export function RiskGateActions({
  sequence
}: {
  sequence?: string[];
}) {

  const steps =
    sequence || [];

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-xl border border-amber-800 bg-slate-950 p-4">
      <div className="text-sm font-semibold text-white">
        Risk Gate Actions
      </div>

      <div className="mt-3 space-y-2">
        {steps.map((step: string, index: number) => (
          <div
            key={`${step}-${index}`}
            className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-300"
          >
            {index + 1}. {step}
          </div>
        ))}
      </div>
    </div>
  );
}
