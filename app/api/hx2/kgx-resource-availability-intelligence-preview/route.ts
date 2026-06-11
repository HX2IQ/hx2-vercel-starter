import { NextResponse } from "next/server";
import { buildKgxResourceAvailabilityIntelligence } from "../_lib/kgx-resource-availability-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const availability =
    await buildKgxResourceAvailabilityIntelligence();

  return NextResponse.json({
    ok: true,
    resource_availability_intelligence_active: true,
    availability
  });
}
