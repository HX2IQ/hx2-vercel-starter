import type { AP2RequestBody } from "../../taskRouter";

export async function registryStatus(body: AP2RequestBody) {
  return {
    ok: true,
    service: "registry",
    status: "online",
    message: "registry status (stub)",
  };
}

export async function registryList(body: AP2RequestBody) {
  return {
    ok: true,
    nodes: [],
    message: "registry list (stub)",
  };
}

export async function registryNodeInstall(body: AP2RequestBody) {
  const node = (body as any)?.task?.node ?? null;
  return {
    ok: true,
    installed: true,
    node,
    message: "registry node install (stub)",
  };
}


