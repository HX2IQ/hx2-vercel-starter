import { NextResponse } from "next/server";
import { prisma } from "../_lib/kgx-lite";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const nodeKey =
      url.searchParams.get("nodeKey") ||
      "HX2";

    const node = await prisma.node.findFirst({
      where: {
        nodeKey
      }
    });

    if (!node) {
      return NextResponse.json(
        {
          ok: false,
          error: "Node not found"
        },
        { status: 404 }
      );
    }

    const outgoingRelationships =
      await prisma.kgxRelationship.findMany({
        where: {
          sourceType: "Node",
          sourceId: nodeKey
        },
        orderBy: {
          createdAt: "desc"
        }
      });

    const incomingRelationships =
      await prisma.kgxRelationship.findMany({
        where: {
          targetType: "Node",
          targetId: nodeKey
        },
        orderBy: {
          createdAt: "desc"
        }
      });

    const executions =
      await prisma.executionEvent.findMany({
        where: {
          nodeId: node.id
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 25
      });

    const audits =
      await prisma.auditEvent.findMany({
        orderBy: {
          createdAt: "desc"
        },
        take: 25
      });

    return NextResponse.json({
      ok: true,
      kgx_graph_recall_active: true,
      node,
      graph: {
        outgoingRelationships,
        incomingRelationships,
        executions,
        audits
      }
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "graph recall failed"
      },
      { status: 500 }
    );
  }
}
