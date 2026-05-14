import fs from "node:fs";
import path from "node:path";

export type Hx2RegistryNode = {
  node_id: string;
  node_label?: string;
  route_path?: string;
  status?: string;
  activation?: {
    enabled?: boolean;
    dry_run_only?: boolean;
  };
};

export type Hx2RegistryShape =
  | Hx2RegistryNode[]
  | { nodes?: Hx2RegistryNode[] }
  | Hx2RegistryNode;

function getRegistryPath() {
  return path.join(process.cwd(), "app", "api", "hx2", "registry", "nodes.json");
}

export function readRegistry(): Hx2RegistryNode[] {
  const registryPath = getRegistryPath();

  if (!fs.existsSync(registryPath)) {
    throw new Error(`Registry file not found: ${registryPath}`);
  }

  const raw = fs.readFileSync(registryPath, "utf8");
  const parsed = JSON.parse(raw) as Hx2RegistryShape;

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (parsed && typeof parsed === "object" && "nodes" in parsed && Array.isArray(parsed.nodes)) {
    return parsed.nodes;
  }

  if (parsed && typeof parsed === "object" && "node_id" in parsed && typeof parsed.node_id === "string") {
    return [parsed as Hx2RegistryNode];
  }

  throw new Error("Registry file format invalid: expected array, { nodes: [] }, or single node object");
}

export function getNodeById(nodeId: string): Hx2RegistryNode | null {
  const nodes = readRegistry();
  return nodes.find((n) => n.node_id === nodeId) ?? null;
}
