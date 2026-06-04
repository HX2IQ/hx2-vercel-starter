import { NextResponse } from "next/server";
import { prisma } from "../_lib/kgx-lite";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const memoryType =
      body?.memoryType ||
      "kgx_test_memory";

    const memoryKey =
      body?.memoryKey ||
      `kgx_test_${Date.now()}`;

    const payload =
      body?.payload ||
      {
        source: "kgx-memory-write",
        message: "KGX memory write test",
        created_by: "KGX-C Execution Memory Writer"
      };

    const memory = await prisma.memoryRecord.create({
      data: {
        memoryType,
        memoryKey,
        payload
      }
    });

    const audit = await prisma.auditEvent.create({
      data: {
        eventType: "kgx_memory_write",
        eventSource: "api/hx2/kgx-memory-write",
        payload: {
          memory_id: memory.id,
          memory_type: memory.memoryType,
          memory_key: memory.memoryKey
        }
      }
    });

    return NextResponse.json({
      ok: true,
      kgx_write_active: true,
      memory,
      audit
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        kgx_write_active: false,
        error: err?.message || "KGX memory write failed"
      },
      { status: 500 }
    );
  }
}
