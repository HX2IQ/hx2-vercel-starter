import fs from "fs";
import path from "path";
import type { Hx2NodeSpec } from "./node-spec";
import { buildNodeDryRun } from "./node-build-dry-run";

export type NodeBuildApplyResult = {
  ok: boolean;
  node_id: string;
  written_files: Array<{ path: string; backup_path: string | null }>;
  skipped_files: string[];
  registry_patch: Record<string, any>;
  next_steps: string[];
  activation_blockers: string[];
};

export function applyNodeBuild(spec: Hx2NodeSpec, rootDir: string): NodeBuildApplyResult {
  const dryRun = buildNodeDryRun(spec);

  const written_files: Array<{ path: string; backup_path: string | null }> = [];
  const skipped_files: string[] = [];

  for (const file of dryRun.files_to_write) {
    const absPath = path.join(rootDir, file.path);
    const absDir = path.dirname(absPath);

    fs.mkdirSync(absDir, { recursive: true });

    let backup_path: string | null = null;

    if (fs.existsSync(absPath)) {
      backup_path = `${absPath}.bak.${Date.now()}`;
      fs.copyFileSync(absPath, backup_path);
    }

    fs.writeFileSync(absPath, file.content, "utf8");
    written_files.push({ path: file.path, backup_path });
  }

  return {
    ok: true,
    node_id: spec.node_id,
    written_files,
    skipped_files,
    registry_patch: dryRun.registry_patch,
    next_steps: [
      "run next build",
      `POST /api/hx2/nodes/${spec.node_id}`,
      "verify scaffold_only response",
      "review registry patch before activation",
    ],
    activation_blockers: dryRun.activation_blockers,
  };
}
