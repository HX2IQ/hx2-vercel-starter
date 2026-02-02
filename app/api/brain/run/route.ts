import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/owner";

export const runtime = "nodejs";

const ALLOWED_MODELS = new Set([
  "gpt-4.1-mini",
  "gpt-4.1",
  "gpt-4o-mini"
]);

function pickModel() {
  const envModel = (process.env.OPENAI_MODEL || "gpt-4.1-mini").trim();
  return ALLOWED_MODELS.has(envModel) ? envModel : "gpt-4.1-mini";
}

export async function POST(req: NextRequest) {
  
  const g = requireOwner(req);
  if (!g.ok) return g.res;
try {
    const { input, mode } = await req.json();

    if ((mode || "SAFE") !== "SAFE") {
      return NextResponse.json({ ok: false, error: "Only SAFE mode is allowed" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ ok: false, error: "OPENAI_API_KEY not set" }, { status: 500 });
    }

    const model = pickModel();
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 25000);

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 220,
        messages: [
          { role: "system", content: "You are HX2 running in SAFE mode. Be concise and factual." },
          { role: "user", content: String(input || "") },
        ],
      }),
    }).finally(() => clearTimeout(t));

    const data: any = await r.json();

    if (!r.ok) {
      // Return enough to debug without leaking anything sensitive
      return NextResponse.json(
        { ok: false, error: "OpenAI error", status: r.status, data },
        { status: 500 }
      );
    }

    const reply = data?.choices?.[0]?.message?.content?.trim?.() ?? null;

    return NextResponse.json({
      ok: true,
      mode: "SAFE",
      model,
      reply,
      raw: { id: data?.id, usage: data?.usage },
      serverUtc: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "OpenAI request timed out" : (e?.message || String(e));
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}