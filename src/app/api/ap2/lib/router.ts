import { handlePing } from "./ping";
import { handleWhoAmI } from "./whoami";

export function routeCommand(command: string, ctx: any) {
  switch (command) {
    case "ping":
      return handlePing(ctx);

    case "whoami":
      return handleWhoAmI(ctx);

    default:
      return {
        ok: false,
        error: "Unknown command",
        command,
        router: "ap2"
      };
  }
}
