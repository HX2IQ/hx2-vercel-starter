import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

function hash8(s: string) {
  return crypto.createHash("sha256").update(s || "").digest("hex").slice(0, 8);
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const expected = (process.env.HX2_API_KEY || "").trim();

  return NextResponse.json({
    ok: true,
    received: {
      hasAuthHeader: !!auth,
      bearerDetected: auth.startsWith("Bearer "),
      tokenLen: token.length,
      tokenHash8: hash8(token),
    },
    expected: {
      expectedLen: expected.length,
      expectedHash8: hash8(expected),
      envPresent: !!process.env.HX2_API_KEY,
    },
    match: token && expected ? token === expected : false,
    ts: new Date().toISOString(),
  });
}
