import { NextResponse } from "next/server";
import { buildKgxSecondOrderConsequenceIntelligence } from "../_lib/kgx-second-order-consequence-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const consequence =
    await buildKgxSecondOrderConsequenceIntelligence();

  return NextResponse.json({
    ok: true,
    second_order_consequence_intelligence_active: true,
    consequence
  });
}
