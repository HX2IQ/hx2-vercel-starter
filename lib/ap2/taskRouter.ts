export type SafeMode = "SAFE" | "safe";

export type AP2Task =
  | { type: "__router_id__" }
  | { type: "ping" }
  | { type: "whoami" };

export type AP2RequestBody = {
  mode?: SafeMode | string;
  task?: AP2Task;
  command?: string; // accept legacy callers too
};

export type AP2Result = {
  ok: boolean;
  mode: string;
  endpoint: "ap2.execute";
  router?: string;
  executed?: any;
  received?: any;
  error?: string;
};

export async function routeTask(body: AP2RequestBody): Promise<AP2Result> {
  const mode = (body?.mode ?? "SAFE") as string;

  // Support BOTH formats:
  // - new: { task: { type: "ping" } }
  // - old: { command: "ping" }
  const type = body?.task?.type ?? (body?.command ? String(body.command) : "");

  if (type === "__router_id__") {
    return { ok: true, mode, endpoint: "ap2.execute", router: "REAL_TASK_ROUTER_v1" };
  }

  if (type === "ping") {
    return { ok: true, mode, endpoint: "ap2.execute", executed: { pong: true } };
  }

  if (type === "whoami") {
    return { ok: true, mode, endpoint: "ap2.execute", executed: { service: "hx2-vercel-starter", mode } };
  }

  return { ok: false, mode, endpoint: "ap2.execute", received: body, error: `Unknown task/command: ${type || "(blank)"}` };
}
