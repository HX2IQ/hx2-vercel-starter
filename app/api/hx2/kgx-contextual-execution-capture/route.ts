import { NextResponse } from "next/server";
import { writeKgxContextualExecution } from "../_lib/kgx-contextual-execution-capture";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {

  const body = await req.json();

  const result =
    await writeKgxContextualExecution(body);

  return NextResponse.json({
    ok: true,
    kgx_contextual_execution_capture_active: true,
    result
  });
}
