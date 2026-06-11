import { NextResponse } from "next/server";
import { buildKgxDeepConsumptionIntegration } from "../_lib/kgx-deep-consumption-integration";

export const dynamic = "force-dynamic";

export async function GET() {
  const integration =
    await buildKgxDeepConsumptionIntegration();

  return NextResponse.json({
    ok: true,
    kgx_deep_consumption_integration_active: true,
    integration
  });
}
