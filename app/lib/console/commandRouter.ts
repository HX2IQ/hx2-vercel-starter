export type HX2Body = {
  command: string;
  mode?: "SAFE" | "OWNER";
  node?: any;
  payload?: any;
};

export async function routeCommand(body: HX2Body) {
  switch (body.command) {
    case "registry.node.install":
      return {
        ok: true,
        service: "registry",
        executed: "registry.node.install",
        data: body.node ?? null,
      };

    case "registry.status":
      return {
        ok: true,
        service: "registry",
        executed: "registry.status",
        data: { status: "stub-ok" },
      };

    default:
      return {
        ok: false,
        error: "Unknown command",
        command: body.command,
      };
  }
}











