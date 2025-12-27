import { registryStatus } from "@/app/lib/registry/store";

export async function handleRegistryStatus() {
  const status = registryStatus();
  return {
    ok: true,
    executed: "registry.status",
    message: "Registry status",
    data: status,
  };
}
