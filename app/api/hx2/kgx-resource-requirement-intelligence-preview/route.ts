import { NextResponse } from "next/server";
import { buildKgxResourceRequirementIntelligence } from "../_lib/kgx-resource-requirement-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const requirements =
    await buildKgxResourceRequirementIntelligence();

  return NextResponse.json({
    ok: true,
    resource_requirement_intelligence_active: true,
    requirements
  });
}
