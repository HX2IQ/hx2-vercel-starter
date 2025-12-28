import { ping } from "./handlers/safe/ping";

export async function routeTask(body: any) {
  const mode = body?.mode ?? "SAFE";
  const task = body?.task ?? {};

  // router identity probe
  if (task?.type === "__router_id__") {
    return { ok: true, mode, endpoint: "ap2.execute", router: "REAL_TASK_ROUTER_v1" };
  }

  if (task?.type === "ping") {
    return ping();
  }

  return {
    ok: false,
    mode,
    endpoint: "ap2.execute",
    error: `Unknown task type: ${task?.type}`
  };
}
