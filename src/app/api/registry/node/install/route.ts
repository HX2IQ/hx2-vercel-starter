import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: any = {};

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { status: "error", error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { id, type, mode } = body;

  if (mode !== "safe" && mode !== "SAFE") {
    return NextResponse.json(
      { status: "error", error: "Only SAFE mode allowed" },
      { status: 400 }
    );
  }

  if (!id || !type) {
    return NextResponse.json(
      { status: "error", error: "Missing id or type" },
      { status: 400 }
    );
  }

  // Dummy registry install (as requested by client)
  return NextResponse.json({
    status: "ok",
    node: {
      id,
      type,
      installed: true,
      mode: "SAFE",
    },
    timestamp: new Date().toISOString(),
  });
}
