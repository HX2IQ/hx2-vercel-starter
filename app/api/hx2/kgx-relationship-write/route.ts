import { NextResponse } from "next/server";
import { prisma } from "../_lib/kgx-lite";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const sourceType = body?.sourceType || "";
    const sourceId = body?.sourceId || "";
    const relationType = body?.relationType || "";
    const targetType = body?.targetType || "";
    const targetId = body?.targetId || "";

    if (!sourceType || !sourceId || !relationType || !targetType || !targetId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing sourceType, sourceId, relationType, targetType, or targetId"
        },
        { status: 400 }
      );
    }

    const relationship = await prisma.kgxRelationship.create({
      data: {
        sourceType,
        sourceId,
        relationType,
        targetType,
        targetId,
        payload: body?.payload || {}
      }
    });

    const audit = await prisma.auditEvent.create({
      data: {
        eventType: "kgx_relationship_created",
        eventSource: "api/hx2/kgx-relationship-write",
        payload: {
          relationship_id: relationship.id,
          source_type: sourceType,
          source_id: sourceId,
          relation_type: relationType,
          target_type: targetType,
          target_id: targetId
        }
      }
    });

    return NextResponse.json({
      ok: true,
      kgx_relationship_mapping_active: true,
      relationship,
      audit
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "relationship write failed"
      },
      { status: 500 }
    );
  }
}
