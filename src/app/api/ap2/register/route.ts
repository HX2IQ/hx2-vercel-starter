import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function POST(req: Request) {
  const unauthorized = requireAuth(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const { name, slug, version, deps = [] } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Missing required fields: name or slug" }, { status: 400 });
    }

    // Mock "registration" response
    return NextResponse.json({
      status: "ok",
      registered: {
        id: Math.floor(Math.random() * 10000),
        name,
        slug,
        version: version || "0.0.1",
        deps,
      },
      message: "Node registered successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
