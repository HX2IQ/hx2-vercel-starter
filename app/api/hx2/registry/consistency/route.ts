import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { readRegistry } from "../../_lib/registry";

export const runtime = "nodejs";

type NodeCheck = {
  node_id: string;
  node_label: string;
  route_path: string;
  registry_status: string;
  enabled: boolean;
  dry_run_only: boolean;
  route_file_exists: boolean;
  helper_file_exists: boolean;
  status_alignment: "ok" | "warning";
  issues: string[];
};

function routePathToFilePath(routePath: string) {
  const clean = routePath.replace(/^\/+/, "");
  return path.join(process.cwd(), "app", clean, "route.ts");
}

function helperPathForNode(nodeId: string) {
  return path.join(process.cwd(), "app", "api", "hx2", "_lib", `${nodeId}.ts`);
}

function inferExpectedStatus(nodeId: string, helperExists: boolean) {
  if (!helperExists) return "scaffold_only";
  if (nodeId === "ah3") return "active_v1_2";
  return "";
}

export async function GET() {
  try {
    const nodes = readRegistry();

    const checks: NodeCheck[] = nodes.map((node) => {
      const routePath = node.route_path || `/api/hx2/nodes/${node.node_id}`;
      const routeFile = routePathToFilePath(routePath);
      const helperFile = helperPathForNode(node.node_id);

      const routeFileExists = fs.existsSync(routeFile);
      const helperFileExists = fs.existsSync(helperFile);

      const enabled = node.activation?.enabled !== false;
      const dryRunOnly = node.activation?.dry_run_only === true;
      const registryStatus = node.status || "";

      const issues: string[] = [];

      if (!routeFileExists) {
        issues.push(`Missing route file: ${routeFile}`);
      }

      if (!helperFileExists) {
        issues.push(`Missing helper file: ${helperFile}`);
      }

      if (!node.route_path) {
        issues.push("Registry route_path missing; default path inferred");
      }

      if (!node.activation) {
        issues.push("Registry activation block missing");
      }

      const expectedStatus = inferExpectedStatus(node.node_id, helperFileExists);

      if (expectedStatus && registryStatus && expectedStatus !== registryStatus) {
        issues.push(`Registry status drift: expected ${expectedStatus}, found ${registryStatus}`);
      }

      const statusAlignment = issues.some((x) => x.includes("Missing") || x.includes("drift"))
        ? "warning"
        : "ok";

      return {
        node_id: node.node_id,
        node_label: node.node_label || "",
        route_path: routePath,
        registry_status: registryStatus,
        enabled,
        dry_run_only: dryRunOnly,
        route_file_exists: routeFileExists,
        helper_file_exists: helperFileExists,
        status_alignment: statusAlignment,
        issues,
      };
    });

    const healthyCount = checks.filter((c) => c.status_alignment === "ok").length;
    const warningCount = checks.length - healthyCount;

    return NextResponse.json(
      {
        ok: true,
        count: checks.length,
        healthy_count: healthyCount,
        warning_count: warningCount,
        nodes: checks,
      },
      {
        status: 200,
        headers: { "x-hx2-registry-consistency-version": "v1" },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown registry consistency error";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 500,
        headers: { "x-hx2-registry-consistency-version": "v1" },
      }
    );
  }
}

