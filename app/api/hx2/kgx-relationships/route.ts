import { NextResponse } from "next/server";
import { prisma } from "../_lib/kgx-lite";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limitParam = Number(url.searchParams.get("limit") || "25");
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 100)
      : 25;

    const relationships = await prisma.kgxRelationship.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    });

    return NextResponse.json({
      ok: true,
      kgx_relationship_recall_active: true,
      count: relationships.length,
      relationships
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "relationship recall failed"
      },
      { status: 500 }
    );
  }
}
