import { NextRequest, NextResponse } from "next/server";

type GuardResult =
  | { ok: true }
  | { ok: false; res: NextResponse };

function getBearer(req: NextRequest): string | null {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

export function requireOwner(req: NextRequest): GuardResult {
  const expected = process.env.HX2_OWNER_KEY;
  if (!expected) {
    // Fail closed: if key isn't set, OWNER access is disabled.
    return {
      ok: false,
      res: NextResponse.json(
        { ok: false, error: { code: "owner_disabled", message: "HX2_OWNER_KEY is not configured" } },
        { status: 503 }
      ),
    };
  }

  const provided =
    getBearer(req) ||
    req.headers.get("x-hx2-owner-key") ||
    req.headers.get("x-hx2-owner");

  if (!provided || provided !== expected) {
    return {
      ok: false,
      res: NextResponse.json(
        { ok: false, error: { code: "unauthorized", message: "owner key required" } },
        { status: 401 }
      ),
    };
  }

  return { ok: true };
}
