export async function handleAp2Status(_body: any) {
  return {
    ok: true,
    service: "ap2_execute",
    mode: _body?.mode ?? "SAFE",
    executed: "ap2.status",
    message: "AP2 status (local stub)",
    data: {
      worker: "local",
      queue_depth: 0,
      last_task: null
    }
  };
}
