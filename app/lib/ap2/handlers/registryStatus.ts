import { getRegistry } from "../registry";

export async function handleRegistryStatus(body: any) {
  const reg = getRegistry();
  return {
    ok: true,
    service: "ap2_execute",
    mode: body?.mode ?? "SAFE",
    executed: "registry.status",
    message: "Registry status",
    data: {
      status: "ok",
      nodeCount: reg.nodes.length,
      lastUpdated: reg.lastUpdated,
    },
  };
}















