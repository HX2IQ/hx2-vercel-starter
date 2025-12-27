export async function handleAp2Status(body: any) {
  const mode = body?.mode ?? "SAFE";
  return {
    ok: true,
    service: "ap2_execute",
    mode,
    executed: "ap2.status",
    message: "AP2 status (local stub)",
    data: {
      worker: "local",
      state: "ready",
      note: "POST-only by design (SAFE payload validation). Add GET alias only if required.",
    },
  };
}
