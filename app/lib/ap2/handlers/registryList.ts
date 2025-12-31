import { listNodes } from "../registry";

export async function handleRegistryList(body: any) {
  const nodes = listNodes();
  return {
    ok: true,
    service: "ap2_execute",
    mode: body?.mode ?? "SAFE",
    executed: "registry.list",
    message: "Registry list",
    data: { nodes },
  };
}















