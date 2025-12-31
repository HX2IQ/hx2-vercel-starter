export async function handleAp2Status() {
  return {
    ok: true,
    executed: "ap2.status",
    message: "AP2 status (local stub)",
    data: { worker: "local", queue_depth: 0, last_task: null },
  };
}











