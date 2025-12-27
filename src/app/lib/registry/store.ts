export type RegistryNode = {
  id: string;
  type?: string;
  mode?: string;
  constraints?: Record<string, any>;
  [k: string]: any;
};

export type RegistryStatus = {
  ok: boolean;
  nodes: number;
  message?: string;
};

/** Compile-safe stub */
export async function registryStatus(): Promise<RegistryStatus> {
  return { ok: true, nodes: 0, message: "stub" };
}

/** Compile-safe stub */
export async function registryList(): Promise<RegistryNode[]> {
  return [];
}

/** Compile-safe stub */
export async function registryUpsert(node: RegistryNode): Promise<RegistryNode> {
  return node;
}
