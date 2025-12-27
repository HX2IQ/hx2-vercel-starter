import { NextRequest, NextResponse } from "next/server";
import { routeCommand } from "../lib/router";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await routeCommand(body);

    return NextResponse.json({
      ok: true,
      result
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "AP2 execution error"
      },
      { status: 500 }
    );
  }
}
