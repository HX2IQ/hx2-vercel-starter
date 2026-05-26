import fs from "fs";
import path from "path";
import type { Hx2RegistryEntry } from "./node-registry";

const REGISTRY_PATH = "app/api/hx2/_registry/nodes.json";

export function loadRegistry(rootDir: string): Record<string, Hx2RegistryEntry> {
  const fullPath = path.join(rootDir, REGISTRY_PATH);

  if (!fs.existsSync(fullPath)) {
    return {};
  }

  const raw = fs.readFileSync(fullPath, "utf8");
  return JSON.parse(raw || "{}");
}

export function saveRegistry(rootDir: string, data: Record<string, Hx2RegistryEntry>) {
  const fullPath = path.join(rootDir, REGISTRY_PATH);
  const dir = path.dirname(fullPath);

  fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(fullPath)) {
    fs.copyFileSync(fullPath, fullPath + ".bak." + Date.now());
  }

  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
}

export function applyRegistryEntry(
  rootDir: string,
  entry: Hx2RegistryEntry
) {
  const registry = loadRegistry(rootDir);

  const exists = !!registry[entry.node_id];

  registry[entry.node_id] = entry;

  saveRegistry(rootDir, registry);

  return {
    ok: true,
    node_id: entry.node_id,
    existed: exists,
    total_nodes: Object.keys(registry).length,
  };
}
