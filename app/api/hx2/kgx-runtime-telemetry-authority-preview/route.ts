import { NextResponse } from "next/server";
import { buildKgxRuntimeTelemetryAuthority } from "../_lib/kgx-runtime-telemetry-authority";

export const dynamic = "force-dynamic";

export async function GET() {
  const telemetry =
    await buildKgxRuntimeTelemetryAuthority();

  return NextResponse.json({
    ok: true,
    kgx_runtime_telemetry_authority_active: true,
    telemetry
  });
}
