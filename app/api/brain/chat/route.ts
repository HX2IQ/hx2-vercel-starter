import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = String(body?.input ?? body?.message ?? "").trim();const apiKey = process.env.OPENAI_API_KEY || "";

    if (!input) {
      return NextResponse.json({ ok: false, error: "Missing input/message" }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const prompt = String(input || "").trim();
    if (!prompt) {
      return NextResponse.json({ ok: false, error: "Missing input" }, { status: 400 });
    }

    // Minimal, reliable OpenAI call (Responses API)
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: prompt,
      }),
    });

    const data = await r.json();
    const reply =
      data?.output_text ??
      data?.output?.[0]?.content?.[0]?.text ??
      null;

    return NextResponse.json({
      ok: true,
      reply: reply ?? "",
      timestamp: new Date().toISOString(),
      brain_version: null,
      brain_attached: false
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}

