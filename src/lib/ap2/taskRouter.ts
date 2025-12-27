export type SafeMode = "SAFE";

export type Ap2Task =
  | { type: "ping" }
  | { type: "help" }
  | { type: "scaffold.execute"; blueprint_name?: string }
  | { type: "registry.node.install"; node?: { id?: string; type?: string; mode?: string } }
  | { type: "registry.list" }
  | { type: string; [k: string]: any };

export type Ap2ExecuteRequest = {
  mode?: SafeMode;
  task?: Ap2Task;
  [k: string]: any;
};

export type Ap2ExecuteResponse = {
  ok: boolean;
  mode: SafeMode;
  executed?: string;
  message?: string;
  data?: any;
  error?: { code: string; message: string };
};

const HELP = {
  note: "Send JSON with { mode:'SAFE', task:{...} }",
  examples: [
    { mode: "SAFE", task: { type: "ping" } },
    { mode: "SAFE", task: { type: "help" } },
    { mode: "SAFE", task: { type: "scaffold.execute", blueprint_name: "console.ui.v2" } },
    { mode: "SAFE", task: { type: "registry.list" } },
    { mode: "SAFE", task: { type: "registry.node.install", node: { id: "hx2-core", type: "stub", mode: "safe" } } }
  ],
  supported_tasks: ["ping","help","scaffold.execute","registry.list","registry.node.install"]
};

export async function runSafeTask(req: Ap2ExecuteRequest): Promise<Ap2ExecuteResponse> {
  const mode: SafeMode = "SAFE";
  const task = req?.task;

  if (!task || typeof task !== "object") {
    return { ok: false, mode, error: { code: "BAD_TASK", message: "Missing task object" } };
  }

  switch (task.type) {
    case "ping":
      return { ok: true, mode, executed: "ping", message: "AP2 executed task: ping" };

    case "help":
      return { ok: true, mode, executed: "help", message: "Supported tasks returned", data: HELP };

    case "scaffold.execute": {
      const blueprint = (task as any).blueprint_name || "unknown";
      return { ok: true, mode, executed: "scaffold.execute", message: `AP2 executed task: scaffold.execute`, data: { blueprint_name: blueprint } };
    }

    case "registry.list":
      return { ok: true, mode, executed: "registry.list", message: "Registry list (stub)", data: { nodes: [], note: "stub list (wire real registry next)" } };

    case "registry.node.install": {
      const node = (task as any).node || {};
      return { ok: true, mode, executed: "registry.node.install", message: "Registry node install (stub)", data: { installed: true, node } };
    }

    default:
      return { ok: false, mode, error: { code: "UNRECOGNIZED_TASK", message: `AP2 does not recognize task: ${task.type} (execute stub)` } };
  }
}
