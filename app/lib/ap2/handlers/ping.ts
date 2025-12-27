export async function handlePing(body: any) {
  return {
    ok: true,
    service: "ap2_execute",
    mode: body?.mode ?? "SAFE",
    executed: "ping",
    received: body?.task ?? body ?? null,
    message: "AP2 executed task: ping",
  };
}
