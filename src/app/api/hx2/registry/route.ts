import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      node_id: "hx2-registry-01",
      name: "Primary HX2 Registry",
      type: "registry",
      endpoint: "/api/hx2",
      status: "active",
      metadata: {}
    }
  ]);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ received: body, status: "ok" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
