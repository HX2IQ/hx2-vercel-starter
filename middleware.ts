import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Real HTTP redirect for root -> /oi
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/oi";
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
