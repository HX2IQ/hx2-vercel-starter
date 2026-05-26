import { NextResponse } from "next/server";
import { readRegistry } from "../../_lib/registry";

export const runtime = "nodejs";

export async function GET() {
  try {
    const nodes = readRegistry();

    const preview = nodes.map((node) => ({
      node_id: node.node_id,
      node_label: node.node_label || "",
      route_path: node.route_path || `/api/hx2/nodes/${node.node_id}`,
      status: node.status || "",
      enabled: node.activation?.enabled !== false,
      dry_run_only: node.activation?.dry_run_only === true,
    }));

    return NextResponse.json(
      {
        ok: true,
        count: preview.length,
        nodes: preview,
      },
      {
        status: 200,
        headers: { "x-hx2-registry-preview-version": "v1" },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown registry preview error";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 500,
        headers: { "x-hx2-registry-preview-version": "v1" },
      }
    );
  }
}
