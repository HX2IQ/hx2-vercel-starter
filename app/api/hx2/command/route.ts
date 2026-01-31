import { NextRequest, NextResponse } from "next/server";
import { listNodes, upsertNode } from "@/lib/registry/registryStore";

// HX2 command gateway (SAFE, infra-only).
// IMPORTANT: No brain logic here. Only SAFE shell commands.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Json = Record<string, any>;

function ok(data: Json, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

function bad(error: string, status = 400, extra: Json = {}) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const body: Json = await req.json().catch(() => ({}));
    const command = String(body.command ?? "");
    const mode = body.mode ?? "SAFE";

    if (!command) return bad("missing_command", 400);

    // Base health
    if (command === "hx2.status") {
      return ok({
        service: "hx2_base",
        mode,
        status: "online",
        ts: new Date().toISOString()
      });
    }

    // Node ping (SAFE shell check)
    if (command === "node.ping") {
      const node = body.node ?? null;
      return ok({
        mode,
        node,
        reply: "pong",
        ts: new Date().toISOString()
      });
    }

    // =========================
    // REGISTRY (SAFE, infra-only)
    // =========================

    if (command === "registry.list") {
      const nodes = await listNodes();
      return ok({
        service: "hx2_registry",
        mode,
        nodes,
        ts: new Date().toISOString()
      });
    }

    if (command === "registry.node.install") {
      const node = body.node;
      if (!node?.id) return bad("missing_node_id", 400);

      await upsertNode(node);

      return ok({
        service: "hx2_registry",
        mode,
        installed: true,
        nodeId: node.id,
        ts: new Date().toISOString()
      });
    }

    return bad("command_not_supported", 400, { command });
  } catch (e: any) {
    return bad("hx2_command_failed", 500, { message: e?.message ?? String(e) });
  }
}
