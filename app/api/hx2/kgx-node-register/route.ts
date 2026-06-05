import { NextResponse } from "next/server";
import { prisma } from "../_lib/kgx-lite";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nodeKey =
      body?.nodeKey ||
      "";

    if (!nodeKey) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing nodeKey"
        },
        { status: 400 }
      );
    }

    const node = await prisma.node.upsert({
      where: {
        nodeKey
      },
      update: {
        displayName:
          body?.displayName ||
          nodeKey,

        category:
          body?.category ||
          "system"
      },
      create: {
        nodeKey,
        displayName:
          body?.displayName ||
          nodeKey,

        category:
          body?.category ||
          "system"
      }
    });

    const audit = await prisma.auditEvent.create({
      data: {
        eventType: "kgx_node_registered",
        eventSource: "api/hx2/kgx-node-register",
        payload: {
          node_id: node.id,
          node_key: node.nodeKey,
          category: node.category
        }
      }
    });

    return NextResponse.json({
      ok: true,
      kgx_node_registry_active: true,
      node,
      audit
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "node registration failed"
      },
      { status: 500 }
    );
  }
}
