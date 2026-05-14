import type { Hx2NodeSpec } from "./node-spec";

export type NodeScaffoldPlan = {
  ok: boolean;
  node_id: string;
  node_label: string;
  suggested_files: string[];
  route_template: string;
  helper_template: string;
  registry_patch: Record<string, any>;
  test_plan: string[];
  activation_mode: string;
};

function esc(s: unknown): string {
  return String(s || "").replace(/"/g, '\\"').trim();
}

function toRunFunctionName(nodeId: string): string {
  const parts = String(nodeId || "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);

  if (!parts.length) return "runNode";

  const tail = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");

  return `run${tail}`;
}

export function buildNodeScaffold(spec: Hx2NodeSpec): NodeScaffoldPlan {
  const nodeId = String(spec.node_id || "").trim();
  const nodeLabel = String(spec.node_label || "").trim();
  const purpose = esc(spec.purpose || "");
  const category = esc(spec.ui?.category || "general");
  const runFn = toRunFunctionName(nodeId);

  const routeFile = `app/api/hx2/nodes/${nodeId}/route.ts`;
  const helperFile = `app/api/hx2/_lib/${nodeId}.ts`;

  const routeTemplate = `import { NextRequest, NextResponse } from "next/server";
import { ${runFn} } from "../../_lib/${nodeId}";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await ${runFn}(body);

    return NextResponse.json({
      ok: true,
      node_id: "${nodeId}",
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        node_id: "${nodeId}",
        error: err?.message || "failed",
      },
      { status: 500 }
    );
  }
}
`;

  const helperTemplate = `export async function ${runFn}(input: any) {
  return {
    node_id: "${nodeId}",
    node_label: "${nodeLabel}",
    purpose: "${purpose}",
    received_input_keys: Object.keys(input || {}),
    status: "scaffold_only",
  };
}
`;

  return {
    ok: true,
    node_id: nodeId,
    node_label: nodeLabel,
    suggested_files: [routeFile, helperFile],
    route_template: routeTemplate,
    helper_template: helperTemplate,
    registry_patch: {
      node_id: nodeId,
      node_label: nodeLabel,
      category,
      purpose: spec.purpose,
      activation: spec.activation || {},
      safety: spec.safety || {},
    },
    test_plan: [
      "validate node spec",
      "write helper file",
      "write route file",
      "run next build",
      `POST /api/hx2/nodes/${nodeId}`,
      `verify response includes node_id="${nodeId}"`,
      "verify output contract",
    ],
    activation_mode: spec.activation?.dry_run_only ? "dry-run-only" : "manual-review-required",
  };
}

