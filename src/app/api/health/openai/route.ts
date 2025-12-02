import { NextResponse } from "next/server";

export async function GET() {
  const start = Date.now();

  try {
    // ✅ Make a very lightweight call to OpenAI
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
      },
    });

    const duration = Date.now() - start;

    if (!res.ok) {
      return NextResponse.json(
        {
          status: "down",
          message: `OpenAI returned ${res.status}`,
          latencyMs: duration,
        },
        { status: 500 }
      );
    }

    // Parse minimal data to confirm structure
    const data = await res.json();
    const modelCount = Array.isArray(data.data) ? data.data.length : 0;

    return NextResponse.json({
      status: "ok",
      latencyMs: duration,
      modelsDetected: modelCount,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "down",
        message: err.message || "Network error",
        checkedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
