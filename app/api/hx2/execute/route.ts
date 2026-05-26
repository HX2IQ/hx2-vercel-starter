import { NextRequest, NextResponse } from "next/server";
import { getNodeById } from "../_lib/registry";

export const runtime = "nodejs";

type ExecuteBody = {
  node_id?: string;
  user_query?: string;
  input?: Record<string, unknown>;
};

function cleanBaseUrl(value?: string | null) {
  const v = (value || "").trim();
  return v.replace(/\/+$/, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExecuteBody;
    const nodeId = (body.node_id || "").trim();

    if (!nodeId) {
      return NextResponse.json(
        {
          ok: false,
          error: "node_id is required",
        },
        { status: 400, headers: { "x-hx2-execute-version": "v2" } }
      );
    }

    const node = getNodeById(nodeId);

    if (!node) {
      return NextResponse.json(
        {
          ok: false,
          error: `Node not found: ${nodeId}`,
        },
        { status: 404, headers: { "x-hx2-execute-version": "v2" } }
      );
    }

    if (node.activation?.enabled === false) {
      return NextResponse.json(
        {
          ok: false,
          error: `Node disabled: ${nodeId}`,
        },
        { status: 403, headers: { "x-hx2-execute-version": "v2" } }
      );
    }

    if (node.activation?.dry_run_only === true) {
      return NextResponse.json(
        {
          ok: true,
          node_id: nodeId,
          route_path: node.route_path || `/api/hx2/nodes/${nodeId}`,
          activation: node.activation || {},
          dry_run_only: true,
          executed: false,
          message: `Node is in dry-run-only mode: ${nodeId}`,
          received: {
            user_query: body.user_query || "",
            input_keys: Object.keys(body.input || {}),
          },
        },
        { status: 200, headers: { "x-hx2-execute-version": "v2" } }
      );
    }

    const baseUrl =
      cleanBaseUrl(process.env.NEXT_PUBLIC_BASE_URL) ||
      cleanBaseUrl(process.env.BASE_URL) ||
      req.nextUrl.origin;

    const routePath = node.route_path || `/api/hx2/nodes/${nodeId}`;
    const targetUrl = `${baseUrl}${routePath}`;

    const payload = {
      user_query: body.user_query || "",
      ...(body.input || {}),
    };

    const upstream = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await upstream.text();

    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = { raw: text };
    }

    return NextResponse.json(
      {
        ok: upstream.ok,
        node_id: nodeId,
        route_path: routePath,
        activation: node.activation || {},
        dry_run_only: false,
        executed: true,
        proxied_status: upstream.status,
        result: parsed,
      },
      {
        status: upstream.ok ? 200 : upstream.status,
        headers: { "x-hx2-execute-version": "v2" },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown execute route error";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500, headers: { "x-hx2-execute-version": "v2" } }
    );
  }
}
