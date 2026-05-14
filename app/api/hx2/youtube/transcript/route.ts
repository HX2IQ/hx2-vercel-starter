import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export const runtime = "nodejs";

function clean(x: any): string {
  return typeof x === "string" ? x.trim() : "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const videoId = clean(body?.video_id || body?.videoId || body?.id);

    if (!videoId) {
      return NextResponse.json(
        { ok: false, error: "missing video_id" },
        { status: 400 }
      );
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoId).catch(() => []);

    const items = (Array.isArray(transcript) ? transcript : []).map((x: any) => ({
      text: clean(x?.text),
      offset: Number(x?.offset ?? 0),
      duration: Number(x?.duration ?? 0),
    })).filter((x: any) => x.text);

    const full_text = items.map((x: any) => x.text).join(" ").trim();

    return NextResponse.json({
      ok: true,
      video_id: videoId,
      n: items.length,
      transcript: items,
      full_text,
      excerpt: full_text.slice(0, 4000),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
