// src/app/api/health/drive/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Ping a public Drive discovery document that requires no auth
    const res = await fetch(
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    return NextResponse.json({
      status: "ok",
      title: data.title,
      description: data.description,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "down",
        error: err.message || "Drive discovery check failed",
        checkedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
