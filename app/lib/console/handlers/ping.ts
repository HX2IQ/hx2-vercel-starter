export async function handlePing(task: any) {
  return {
    ok: true,
    executed: "ping",
    received: { type: task?.type ?? "ping" },
    message: "AP2 executed task: ping",
  };
}











