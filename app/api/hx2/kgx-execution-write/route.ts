import { NextResponse } from "next/server";
import { prisma } from "../_lib/kgx-lite";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nodeKey =
      body?.nodeKey ||
      "hx2-system";

    let node = await prisma.node.findUnique({
      where: {
        nodeKey
      }
    });

    if (!node) {
      node = await prisma.node.create({
        data: {
          nodeKey,
          displayName: nodeKey,
          category: "system"
        }
      });
    }

    const execution = await prisma.executionEvent.create({
      data: {
        nodeId: node.id,
        executionType:
          body?.executionType ||
          "manual_test",

        status:
          body?.status ||
          "completed",

        inputSummary:
          body?.inputSummary ||
          "kgx execution test",

        outputSummary:
          body?.outputSummary ||
          "kgx execution persisted"
      }
    });

    const audit = await prisma.auditEvent.create({
      data: {
        eventType: "kgx_execution_persisted",
        eventSource: "api/hx2/kgx-execution-write",
        payload: {
          execution_id: execution.id,
          node_key: node.nodeKey
        }
      }
    });

    return NextResponse.json({
      ok: true,
      kgx_execution_history_active: true,
      node,
      execution,
      audit
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "execution persistence failed"
      },
      { status: 500 }
    );
  }
}
