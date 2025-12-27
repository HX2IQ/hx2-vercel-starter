import { registryUpsert } from "@/app/lib/registry/store";

const BLUEPRINTS: Record<string, any[]> = {
  "console.ui.v1": [
    { id: "console-ui", type: "ui", mode: "safe", status: "installed", meta: { blueprint: "console.ui.v1" } }
  ],
  "console.ui.v2": [
    { id: "console-ui", type: "ui", mode: "safe", status: "installed", meta: { blueprint: "console.ui.v2" } }
  ]
};

export async function handleScaffoldExecute(body: any) {
  const blueprint = body?.task?.blueprint_name;
  const items = BLUEPRINTS[blueprint];

  if (!blueprint) {
    return { ok: false, error: "blueprint_name is required", executed: "scaffold.execute" };
  }
  if (!items) {
    return { ok: false, error: `unknown blueprint: ${blueprint}`, executed: "scaffold.execute" };
  }

  const created = items.map(n => registryUpsert(n));

  return {
    ok: true,
    service: "ap2_execute",
    mode: body?.mode ?? "SAFE",
    executed: "scaffold.execute",
    message: "Scaffold completed",
    data: {
      blueprint,
      created
    }
  };
}
