import { NextResponse } from "next/server";
import { buildKgxExpectedValueIntelligence } from "../_lib/kgx-expected-value-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const expectedValue =
    await buildKgxExpectedValueIntelligence();

  return NextResponse.json({
    ok: true,
    expected_value_intelligence_active: true,
    expectedValue
  });
}
