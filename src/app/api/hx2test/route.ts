import { NextResponse } from "next/server";

export async function GET() {
  // Choose correct base URL
  const baseUrl =
    process.env.APP_BASE_URL ||
    (process.env.VERCEL_ENV === "production"
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  // Fetch live system status JSON from /api/status
  try {
    const res = await fetch(`${baseUrl}/api/status`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    // If the response is HTML (not JSON), handle gracefully
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json);
    } catch {
      throw new Error("Invalid JSON response from /api/status");
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "HX2 connection failed",
        message: err.message,
      },
      { status: 500 }
    );
  }
}
