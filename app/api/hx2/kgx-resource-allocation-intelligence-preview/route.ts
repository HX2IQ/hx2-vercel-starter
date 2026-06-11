import { NextResponse } from "next/server";
import { buildKgxResourceAllocationIntelligence } from "../_lib/kgx-resource-allocation-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const allocation =
    await buildKgxResourceAllocationIntelligence();

  return NextResponse.json({
    ok: true,
    resource_allocation_intelligence_active: true,
    allocation
  });
}
