import { handlePing } from "./handlers/ping";
import { handleRegistryStatus } from "./handlers/registry_status";
import { handleRegistryList } from "./handlers/registry_list";
import { handleRegistryNodeInstall } from "./handlers/registry_node_install";
import { handleAp2Status } from "./handlers/ap2_status";
import { handleAp2TaskEnqueue } from "./handlers/ap2_task_enqueue";
import { handleScaffoldExecute } from "./handlers/scaffold_execute";

export type HX2Body = {
  mode?: "SAFE" | "OWNER" | string;
  task?: {
    type?: string;
    [k: string]: any;
  };
  [k: string]: any;
};

export async function routeCommand(body: HX2Body) {
  const mode = body?.mode ?? "SAFE";
  const type = body?.task?.type ?? "none";

  switch (type) {
    case "ping":
      return handlePing(body);

    case "registry.status":
      return handleRegistryStatus(body);

    case "registry.list":
      return handleRegistryList(body);

    case "registry.node.install":
      return handleRegistryNodeInstall(body);

    case "ap2.status":
      return handleAp2Status(body);

    case "ap2.task.enqueue":
      return handleAp2TaskEnqueue(body);

    case "scaffold.execute":
      return handleScaffoldExecute(body);

    default:
      return {
        ok: false,
        service: "ap2_execute",
        mode,
        executed: type,
        error: `Unknown command: ${type}`,
      };
  }
}
