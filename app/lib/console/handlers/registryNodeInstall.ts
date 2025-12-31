import type { HX2Body } from "../commandRouter";

export async function handleRegistryNodeInstall(body: HX2Body) {
  const node = (body as any)?.node;

  if (!node || typeof node !== "object") {
    return { ok: false, error: "missing_node", hint: 'Expected: { "task":{"type":"registry.node.install"}, "node": { ... } }' };
  }

  // TODO: persist to registry store
  return {
    ok: true,
    service: "ap2_execute",
    mode: body?.mode ?? "SAFE",
    executed: "registry.node.install",
    message: "Node install accepted (stub)",
    data: { installed: true, node: { id: node.id, type: node.type, mode: node.mode } },
  };
}











