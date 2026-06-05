import { NextResponse } from "next/server";
import { prisma } from "../_lib/kgx-lite";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const query =
      (
        body?.query ||
        body?.text ||
        body?.search ||
        ""
      ).toString().trim();

    if (!query) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing search query"
        },
        { status: 400 }
      );
    }

    const memories = await prisma.memoryRecord.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 100
    });

    const q = query.toLowerCase();

    const matches = memories.filter(memory => {
      const blob =
        JSON.stringify(memory).toLowerCase();

      return blob.includes(q);
    });

    await prisma.auditEvent.create({
      data: {
        eventType: "kgx_memory_search",
        eventSource: "api/hx2/kgx-memory-search",
        payload: {
          query,
          match_count: matches.length
        }
      }
    });

    return NextResponse.json({
      ok: true,
      kgx_memory_search_active: true,
      query,
      matchCount: matches.length,
      matches: matches.slice(0, 25)
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "memory search failed"
      },
      { status: 500 }
    );
  }
}
