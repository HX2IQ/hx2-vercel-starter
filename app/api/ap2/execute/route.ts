import { NextResponse } from "next/server";
import { routeCommand } from "../../../lib/console/commandRouter";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result: any = await routeCommand(body);
    const status = result?.ok ? 200 : (result?.status ?? 400);
    return NextResponse.json(result, { status });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "bad_request" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "AP2 execute is online. Use POST." });
}
