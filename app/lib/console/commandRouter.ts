import { handlePing } from "@/app/lib/console/handlers/ping";
import { handleRegistryList } from "@/app/lib/console/handlers/registryList";
import { handleRegistryStatus } from "@/app/lib/console/handlers/registryStatus";
import { handleAp2Status } from "@/app/lib/console/handlers/ap2Status";
import { handleAp2TaskEnqueue } from "@/app/lib/console/handlers/ap2TaskEnqueue";

function badRequest(message: string) {
  return { ok: false, error: "bad_request", message, status: 400 };
}

export async function routeCommand(body: any) {
  const task = body?.task;
  if (!task?.type) return badRequest("Missing body.task.type");

  // Allow console UI to send: { type:"console.command", command:"registry.list" }
  if (task.type === "console.command") {
    const cmd = task.command;
    if (!cmd || typeof cmd !== "string") return badRequest("Missing task.command");
    return routeCommand({ ...body, task: { ...task, type: cmd } });
  }

  switch (task.type) {
    case "ping":
      return await handlePing(task);

    case "registry.list":
      return await handleRegistryList();

    case "registry.status":
      return await handleRegistryStatus();

    case "ap2.status":
      return await handleAp2Status();

    case "ap2.task.enqueue":
      return await handleAp2TaskEnqueue(task);

    default:
      return badRequest(`Unknown task.type: ${task.type}`);
  }
}
