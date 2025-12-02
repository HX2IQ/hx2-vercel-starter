import { NextResponse } from "next/server";

export async function GET() {
  // In future, replace this with an actual subsystem check
  const nodeStatus = { node: "K2", status: "ok", checkedAt: new Date().toISOString() };

  return NextResponse.json(nodeStatus, { status: 200 });
}
