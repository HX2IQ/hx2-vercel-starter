import { NextResponse } from "next/server";

export function requireAuth(_req: Request): NextResponse | null {
  // SAFE MODE: auth disabled for bootstrap
  return null;
}
