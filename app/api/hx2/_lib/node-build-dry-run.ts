import type { Hx2NodeSpec } from "./node-spec";
import type { NodeScaffoldPlan } from "./node-scaffold";
import { buildNodeScaffold } from "./node-scaffold";

export type DryRunFile = {
  path: string;
  content: string;
};

export type NodeBuildDryRunResult = {
  ok: boolean;
  node_id: string;
  normalized_spec: Hx2NodeSpec;
  scaffold: NodeScaffoldPlan;
  files_to_write: DryRunFile[];
  registry_patch: Record<string, any>;
  smoke_test_commands: string[];
  activation_blockers: string[];
};

export function buildNodeDryRun(spec: Hx2NodeSpec): NodeBuildDryRunResult {
  const scaffold = buildNodeScaffold(spec);

  const files_to_write: DryRunFile[] = [
    {
      path: scaffold.suggested_files[0],
      content: scaffold.route_template,
    },
    {
      path: scaffold.suggested_files[1],
      content: scaffold.helper_template,
    },
  ];

  const smoke_test_commands = [
    `npm run build`,
    `POST /api/hx2/nodes/${spec.node_id}`,
    `verify response includes node_id="${spec.node_id}"`,
    `verify status is scaffold_only before activation`,
  ];

  const activation_blockers: string[] = [];

  if (spec.activation?.dry_run_only) {
    activation_blockers.push("dry_run_only is true");
  }

  if (spec.safety?.requires_review) {
    activation_blockers.push("requires_review is true");
  }

  return {
    ok: true,
    node_id: spec.node_id,
    normalized_spec: spec,
    scaffold,
    files_to_write,
    registry_patch: scaffold.registry_patch,
    smoke_test_commands,
    activation_blockers,
  };
}
