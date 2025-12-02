
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = new Set([
  "https://optinodeiq.com",
  "http://localhost:3000"
]);

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  if (url.pathname.startsWith("/api/assist")) {
    const origin = req.headers.get("origin") || "";
    const token = req.headers.get("x-hx2-internal") || "";
    if (!ALLOWED_ORIGINS.has(origin)) return new NextResponse("forbidden origin", { status: 403 });
    if (!token || token !== process.env.HX2_INTERNAL_TOKEN) return new NextResponse("unauthorized", { status: 401 });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/api/assist/:path*"] };
