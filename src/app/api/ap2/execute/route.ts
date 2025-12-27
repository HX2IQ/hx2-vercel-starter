import { NextResponse } from "next/server";
import { handleAp2Command } from "../lib/router";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const out = await handleAp2Command(body);
    return NextResponse.json(out, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Bad request", detail: e?.message ?? String(e) },
      { status: 400 }
    );
  }
}
