import { ping } from "./ping";
import { whoami } from "./whoami";

export async function routeCommand(command: string) {
  switch (command) {
    case "ping":
      return await ping();
    case "whoami":
      return await whoami();
    default:
      return {
        ok: false,
        error: "Unknown command",
        command
      };
  }
}
