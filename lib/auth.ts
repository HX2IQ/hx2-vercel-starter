import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Minimal, compile-safe auth helper.
 * Replace with real auth (bearer/mTLS/etc) when wiring VPS worker.
 */
export function assertAuthorized(_req: NextRequest): void {
  // No-op for now (SAFE build). Implement real checks later.
}

export function getBearerToken(req: NextRequest): string | null {
  const h = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

export function requireAuth(_req: Request): NextResponse | null {
  // Compile-safe stub: allow all for now.
  // Replace with real Bearer/mTLS checks when AP2→VPS wiring is live.
  return null;
}

