export type SafeMode = "SAFE" | "safe";

export type AP2RequestBody = {
  mode?: SafeMode | string;
  task?: {
    type: string;
    [key: string]: any;
  };
};

export type AP2Result = {
  ok: boolean;
  mode: string;
  endpoint: "ap2.execute";
  executed?: any;
  error?: string;
};

export async function routeTask(body: AP2RequestBody): Promise<AP2Result> {
  const mode = body.mode ?? "SAFE";
  const task = body.task ?? {};

  // 🔍 Router identity probe
  if (task.type === "__router_id__") {
    return {
      ok: true,
      mode,
      endpoint: "ap2.execute",
      executed: { router: "REAL_TASK_ROUTER_v1" }
    };
  }

  if (task.type === "ping") {
    return {
      ok: true,
      mode,
      endpoint: "ap2.execute",
      executed: { pong: true }
    };
  }

  if (task.type === "whoami") {
    return {
      ok: true,
      mode,
      endpoint: "ap2.execute",
      executed: { service: "hx2-vercel-starter", mode }
    };
  }

  return {
    ok: false,
    mode,
    endpoint: "ap2.execute",
    error: `Unknown task type: ${task.type}`
  };
}
