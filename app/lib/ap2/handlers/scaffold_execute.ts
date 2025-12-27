export async function handleScaffoldExecute(body: any) {
  const mode = body?.mode ?? "SAFE";
  const blueprint = body?.task?.blueprint_name ?? body?.blueprint_name ?? null;

  if (!blueprint) {
    return {
      ok: false,
      service: "ap2_execute",
      mode,
      executed: "scaffold.execute",
      error: "Missing task.blueprint_name",
    };
  }

  // Stubbed: later, this would create files on disk (owner mode) or return a plan (safe mode).
  return {
    ok: true,
    service: "ap2_execute",
    mode,
    executed: "scaffold.execute",
    message: `Scaffold request accepted (stub): ${blueprint}`,
    data: { blueprint_name: blueprint, created: false, note: "Stubbed scaffold — no filesystem writes yet." },
  };
}
