import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Hard no-cache for /chat
  if (req.nextUrl.pathname === "/chat") {
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    res.headers.set("Surrogate-Control", "no-store");
  }

  return res;
}

export const config = {
  matcher: ["/chat"],
};
