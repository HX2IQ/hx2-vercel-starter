import { upsertNode } from "../registry";

export async function handleScaffoldExecute(body: any) {
  const blueprint = body?.task?.blueprint_name || body?.blueprint_name;

  if (!blueprint) {
    return {
      ok: false,
      service: "ap2_execute",
      mode: body?.mode ?? "SAFE",
      executed: "scaffold.execute",
      error: "missing_blueprint_name",
      hint: 'Send: { "mode":"SAFE", "task": { "type":"scaffold.execute", "blueprint_name":"console.ui.v1" } }',
    };
  }

  // Example scaffold result: we register a "console-ui" node as proof of work
  if (blueprint === "console.ui.v1") {
    upsertNode({
      id: "console-ui",
      type: "ui",
      mode: "safe",
      meta: { blueprint: "console.ui.v1" },
    });

    return {
      ok: true,
      service: "ap2_execute",
      mode: body?.mode ?? "SAFE",
      executed: "scaffold.execute",
      message: "Scaffold completed",
      data: {
        blueprint: "console.ui.v1",
        created: ["registry.node:console-ui"],
      },
    };
  }

  // Unknown blueprint
  return {
    ok: false,
    service: "ap2_execute",
    mode: body?.mode ?? "SAFE",
    executed: "scaffold.execute",
    error: "unknown_blueprint",
    data: { blueprint },
    allowed: ["console.ui.v1"],
  };
}
