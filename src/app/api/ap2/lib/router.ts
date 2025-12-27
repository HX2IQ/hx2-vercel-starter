export async function routeCommand(command: string, body: any) {
  switch (command) {
    case "ping":
      return {
        ok: true,
        result: "pong",
        router: "REAL"
      };

    case "whoami":
      return {
        ok: true,
        result: "hx2-ap2",
        router: "REAL"
      };

    case "__router_id__":
      return {
        ok: true,
        router: "REAL",
        version: "v1"
      };

    default:
      return {
        ok: false,
        error: "Unknown command (REAL router)",
        command
      };
  }
}
