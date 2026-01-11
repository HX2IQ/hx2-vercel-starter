import { NextResponse } from "next/server";
import { requireHx2Auth } from "../../../_lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const deny = await requireHx2Auth(req);
  if (deny) return deny;

  return NextResponse.json(
    { ok: true, id: ctx?.params?.id ?? null, ts: new Date().toISOString() },
    { status: 200 }
  );
}
