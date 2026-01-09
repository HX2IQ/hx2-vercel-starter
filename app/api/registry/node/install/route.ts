import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // TODO: implement registry.node.install
  return NextResponse.json({ ok: false, status: 501, error: "Not implemented" }, { status: 501 });
}
