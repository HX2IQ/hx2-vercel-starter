import { NextRequest, NextResponse } from "next/server";
import { routeCommand } from "@/app/api/ap2/lib/router";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const command = body.command;

    const result = await routeCommand(command, body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unhandled error" },
      { status: 500 }
    );
  }
}
