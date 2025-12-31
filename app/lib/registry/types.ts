export type Hx2Node = {
  id: string;
  type: string;
  mode?: string;
  constraints?: Record<string, any>;
  meta?: Record<string, any>;
  createdAt: string;
};

export type RegistryState = {
  nodes: Hx2Node[];
  updatedAt: string;
};











