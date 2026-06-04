import { NextResponse } from "next/server";
import { prisma } from "../_lib/kgx-lite";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const counts = {
      nodes: await prisma.node.count(),
      executions: await prisma.executionEvent.count(),
      plans: await prisma.capabilityPlan.count(),
      memories: await prisma.memoryRecord.count(),
      audits: await prisma.auditEvent.count()
    };

    return NextResponse.json({
      ok: true,
      kgx_active: true,
      schema_ready: true,
      counts
    });
  }
  catch (err: any) {
    return NextResponse.json({
      ok: true,
      kgx_active: true,
      schema_ready: false,
      warning: "KGX schema has not been applied to the database yet.",
      error: err?.message || "kgx schema unavailable"
    });
  }
}
