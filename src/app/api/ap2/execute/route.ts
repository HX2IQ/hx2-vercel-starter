import { NextRequest, NextResponse } from "next/server";
import { routeCommand } from "../lib/router";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const command = body?.command;

    if (!command) {
      return NextResponse.json(
        { ok: false, error: "Missing command" },
        { status: 400 }
      );
    }

    const result = await routeCommand(command, body);

    return NextResponse.json({
      ok: true,
      command,
      result
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unhandled error" },
      { status: 500 }
    );
  }
}
