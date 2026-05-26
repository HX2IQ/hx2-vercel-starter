import { NextRequest, NextResponse } from "next/server";
import { getNodeById } from "../../_lib/registry";

export const runtime = "nodejs";

function cleanBaseUrl(value?: string | null) {
  const v = (value || "").trim();
  return v.replace(/\/+$/, "");
}

export async function GET(req: NextRequest) {
  try {
    const nodeId = (req.nextUrl.searchParams.get("node_id") || "").trim();

    if (!nodeId) {
      return NextResponse.json(
        { ok: false, error: "node_id query parameter is required" },
        { status: 400, headers: { "x-hx2-registry-detail-version": "v2" } }
      );
    }

    const node = getNodeById(nodeId);

    if (!node) {
      return NextResponse.json(
        { ok: false, error: `Node not found: ${nodeId}` },
        { status: 404, headers: { "x-hx2-registry-detail-version": "v2" } }
      );
    }

    const baseUrl =
      cleanBaseUrl(process.env.NEXT_PUBLIC_BASE_URL) ||
      cleanBaseUrl(process.env.BASE_URL) ||
      req.nextUrl.origin;

    const routePath = node.route_path || `/api/hx2/nodes/${node.node_id}`;
    const targetUrl = `${baseUrl}${routePath}`;

    let routeReachable = false;
    let routeProbeStatus: number | null = null;
    let routeProbeOk = false;
    let routeProbeResultStatus: string | null = null;

    try {
      const probe = await fetch(targetUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user_query: "ping" }),
        cache: "no-store",
      });

      routeReachable = true;
      routeProbeStatus = probe.status;
      routeProbeOk = probe.ok;

      const text = await probe.text();

      try {
        const parsed = text ? JSON.parse(text) : null;
        routeProbeResultStatus =
          parsed?.result?.status ||
          parsed?.status ||
          null;
      } catch {
        routeProbeResultStatus = null;
      }
    } catch {
      routeReachable = false;
    }

    const enabled = node.activation?.enabled !== false;
    const dryRunOnly = node.activation?.dry_run_only === true;
    const registryStatus = node.status || "";

    const issues: string[] = [];

    if (!routeReachable) {
      issues.push("Route not reachable");
    }

    if (routeReachable && !routeProbeOk) {
      issues.push(`Route returned non-OK status: ${routeProbeStatus}`);
    }

    if (!node.route_path) {
      issues.push("Registry route_path missing; default path inferred");
    }

    if (!node.activation) {
      issues.push("Registry activation block missing");
    }

    if (
      routeProbeResultStatus &&
      registryStatus &&
      routeProbeResultStatus !== registryStatus
    ) {
      issues.push(
        `Runtime status drift: node returned ${routeProbeResultStatus}, registry shows ${registryStatus}`
      );
    }

    const statusAlignment = issues.length > 0 ? "warning" : "ok";

    return NextResponse.json(
      {
        ok: true,
        node: {
          node_id: node.node_id,
          node_label: node.node_label || "",
          route_path: routePath,
          registry_status: registryStatus,
          enabled,
          dry_run_only: dryRunOnly,
          route_reachable: routeReachable,
          route_probe_status: routeProbeStatus,
          route_probe_ok: routeProbeOk,
          route_probe_result_status: routeProbeResultStatus,
          status_alignment: statusAlignment,
          issues,
          registry_entry: node,
        },
      },
      {
        status: 200,
        headers: { "x-hx2-registry-detail-version": "v2" },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown registry detail error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500, headers: { "x-hx2-registry-detail-version": "v2" } }
    );
  }
}
