export type RegistryNode = {
  id: string;
  type: string;
  mode?: "safe" | "owner";
  constraints?: Record<string, any>;
  meta?: Record<string, any>;
};

const state = {
  nodes: [] as RegistryNode[],
  lastUpdated: new Date().toISOString(),
};

export function getRegistry() {
  return state;
}

export function listNodes() {
  return state.nodes;
}

export function upsertNode(node: RegistryNode) {
  const idx = state.nodes.findIndex(n => n.id === node.id);
  if (idx >= 0) state.nodes[idx] = { ...state.nodes[idx], ...node };
  else state.nodes.push(node);
  state.lastUpdated = new Date().toISOString();
  return node;
}













