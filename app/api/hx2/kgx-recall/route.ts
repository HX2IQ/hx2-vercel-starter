import { NextResponse } from "next/server";
import { prisma } from "../_lib/kgx-lite";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const limitParam = Number(url.searchParams.get("limit") || "10");
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 50)
      : 10;

    const memories = await prisma.memoryRecord.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    });

    const plans = await prisma.capabilityPlan.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    });

    const executions = await prisma.executionEvent.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: limit,
      include: {
        node: true
      }
    });

    const audits = await prisma.auditEvent.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    });

    return NextResponse.json({
      ok: true,
      kgx_recall_active: true,
      limit,
      counts: {
        memories: memories.length,
        plans: plans.length,
        executions: executions.length,
        audits: audits.length
      },
      recall: {
        memories,
        plans,
        executions,
        audits
      }
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        kgx_recall_active: false,
        error: err?.message || "KGX recall failed"
      },
      { status: 500 }
    );
  }
}
