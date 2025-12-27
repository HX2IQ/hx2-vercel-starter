export type RegistryNode = {
  id: string;
  type: string;
  status?: string;
};

const registry: RegistryNode[] = [];

export function registryList(): RegistryNode[] {
  return registry;
}

export function registryRegister(node: RegistryNode) {
  registry.push(node);
}

export function registryClear() {
  registry.length = 0;
}
