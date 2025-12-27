export type SafeMode = "SAFE" | "safe";

export type AP2Task =
  | { type: "ping" }
  | { type: "registry.status" }
  | { type: "registry.list" }
  | { type: "registry.node.install"; node: { id: string; type?: string; mode?: string } }
  | { type: "scaffold.execute"; blueprint_name: string };

export type AP2RequestBody = {
  mode?: SafeMode | string;
  task?: AP2Task | any;
};

export type AP2Result = {
  ok: boolean;
  mode: "SAFE";
  endpoint: "ap2.execute";
  received?: any;
  executed?: any;
  error?: string;
};

type Handler = (body: AP2RequestBody) => Promise<any>;

import { ping } from "./handlers/safe/ping";
import { registryStatus, registryList, registryNodeInstall } from "./handlers/safe/registry";
import { scaffoldExecute } from "./handlers/safe/scaffold";

const ROUTES: Record<string, Handler> = {
  "ping": ping,
  "registry.status": registryStatus,
  "registry.list": registryList,
  "registry.node.install": registryNodeInstall,
  "scaffold.execute": scaffoldExecute,
};

export async function runTask(body: AP2RequestBody): Promise<AP2Result> {
  const type = body?.task?.type;
  const mode = "SAFE" as const;

  if (!type || typeof type !== "string") {
    return { ok: false, mode, endpoint: "ap2.execute", received: body, error: "missing_task_type" };
  }

  const handler = ROUTES[type];
  if (!handler) {
    return { ok: false, mode, endpoint: "ap2.execute", received: body, error: `unknown_task_type:${type}` };
  }

  try {
    const executed = await handler(body);
    return { ok: true, mode, endpoint: "ap2.execute", received: body, executed };
  } catch (e: any) {
    return { ok: false, mode, endpoint: "ap2.execute", received: body, error: e?.message ?? "task_failed" };
  }
}
