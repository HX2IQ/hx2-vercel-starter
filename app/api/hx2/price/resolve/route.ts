import { NextRequest, NextResponse } from "next/server";
import { extractLikelyPrice } from "../../_lib/price-extraction";
import { fetchChosenPageText } from "../../_lib/page-fetch";

export const runtime = "nodejs";

function cleanText(s: unknown): string {
  return String(s || "").replace(/\s+/g, " ").trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = cleanText(body?.url);

    if (!url) {
      return NextResponse.json(
        { ok: false, error: "url is required" },
        { status: 400 }
      );
    }

    const pageText = await fetchChosenPageText(url);
    const extracted = extractLikelyPrice(pageText);

    return NextResponse.json({
      ok: true,
      source_url: url,
      found: extracted.found,
      value: extracted.value,
      confidence: extracted.confidence,
      text_length: pageText.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "failed",
      },
      { status: 500 }
    );
  }
}
