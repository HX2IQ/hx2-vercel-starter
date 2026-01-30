import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/chat";
  url.search = ""; // avoid carrying ts params forever
  return NextResponse.redirect(url, 307);
}
