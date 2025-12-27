type RegistryNode = {
  id: string;
  type?: string;
  mode?: string;
};

export function registryUpsert(node: RegistryNode) {
  return node;
}

export function registryList() {
  return [];
}

export function registryStatus() {
  return {
    ok: true,
    nodes: 0,
  };
}
