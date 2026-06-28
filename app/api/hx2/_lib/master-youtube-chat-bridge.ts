function nodeFooter(nodeName: string) {
  return `\n\n---\nOptimized by ${nodeName}`;
}

async function safePostJson(url: string, body: any) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body ?? {}),
      cache: "no-store"
    });

    let data: any = null;

    try {
      data = await res.json();
    } catch {}

    return {
      ok: res.ok,
      status: res.status,
      data
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: {
        ok: false,
        error: err?.message || String(err)
      }
    };
  }
}
function wantsYouTubeChatAnswer(input: string): boolean {
  const q =
    String(input || "").toLowerCase();

  if (/https?:\/\/[^\s]*(youtube\.com|youtu\.be)[^\s]*/i.test(q)) {
    return true;
  }

  return /\b(youtube|video|videos|transcript|watch|podcast|interview|channel)\b/.test(q);
}

function summarizeTranscriptSignal(text: any): string {
  const raw =
    String(text || "").trim();

  if (!raw) {
    return "Transcript was not available for this video, so the answer is based on the video metadata only.";
  }

  const normalized =
    raw
      .replace(/\[[^\]]+\]/g, " ")
      .replace(/[♪♫]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const lower =
    normalized.toLowerCase();

  if (/never gonna give you up|never gonna let you down|never gonna run around/.test(lower)) {
    return "The transcript appears to be primarily music or lyrics content. High-level summary: it centers on commitment and reassurance; transcript text is not reproduced.";
  }

  const stop =
    new Set([
      "the", "and", "that", "this", "with", "from", "have", "has", "for", "you", "your",
      "are", "was", "were", "they", "them", "will", "would", "can", "could", "about",
      "into", "over", "what", "when", "where", "why", "how", "not", "but", "all",
      "our", "their", "there", "here", "been", "being", "than", "then", "just",
      "like", "really", "very", "more", "some", "video", "youtube"
    ]);

  const counts: Record<string, number> = {};

  for (const token of lower.replace(/[^a-z0-9\s]/g, " ").split(/\s+/)) {
    if (token.length < 4 || stop.has(token)) continue;
    counts[token] = (counts[token] || 0) + 1;
  }

  const topTerms =
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([term]) => term);

  if (topTerms.length > 0) {
    return `Transcript signal: the content appears to center on ${topTerms.join(", ")}.`;
  }

  return "Transcript was extracted successfully; transcript text is not reproduced.";
}

function synthesizeYouTubeRouterResult(input: string, routed: any): string {
  const result =
    routed?.result || {};

  const chosen =
    result?.chosen_video || {};

  const search =
    result?.search || {};

  const transcript =
    result?.transcript || {};

  const title =
    String(chosen?.title || "Untitled YouTube video").trim();

  const videoId =
    String(chosen?.video_id || "").trim();

  const url =
    String(chosen?.url || "").trim();

  const provider =
    String(search?.provider || result?.source || "youtube").trim();

  const transcriptText =
    String(transcript?.full_text || chosen?.transcript_text || "").trim();

  const transcriptChars =
    transcriptText.length ||
    Number(chosen?.transcript_chars || 0);

  const transcriptItems =
    Number(transcript?.n || 0);

  const transcriptAvailable =
    transcriptChars > 0 ||
    !!chosen?.transcript_available;

  const topVideos =
    Array.isArray(search?.results)
      ? search.results.slice(0, 3)
      : [];

  const lines = [
    "YouTube retrieval result:",
    "",
    `Selected video: ${title}`,
    videoId ? `Video ID: ${videoId}` : "",
    url ? `URL: ${url}` : "",
    `Retrieval path: ${String(result?.source || "youtube").trim()} / ${provider}`,
    `Transcript: ${transcriptAvailable ? `available (${transcriptItems || "unknown"} items, ${transcriptChars.toLocaleString("en-US")} chars)` : "not available"}`,
    "",
    "Summary:",
    summarizeTranscriptSignal(transcriptText)
  ].filter(Boolean);

  if (topVideos.length > 0) {
    lines.push("");
    lines.push("Top videos checked:");

    for (const item of topVideos) {
      const itemTitle =
        String(item?.title || "Untitled video").trim();

      const itemId =
        String(item?.video_id || "").trim();

      lines.push(`• ${itemTitle}${itemId ? ` (${itemId})` : ""}`);
    }
  }

  lines.push("");
  lines.push("---");
  lines.push("Optimized by HX2 YouTube Retrieval Intelligence");

  return lines.join("\n");
}

export async function synthesizeYouTubeChatAnswer(input: string, base: string): Promise<string> {
  if (!wantsYouTubeChatAnswer(input)) {
    return "";
  }

  const routed =
    await safePostJson(`${base}/api/hx2/source-router`, {
      q: input,
      limit: 3
    });

  if (!routed?.ok || !routed?.data?.ok || routed?.data?.routed_to !== "youtube") {
    return `I detected a YouTube/video request, but the YouTube retrieval route did not return a usable result.${nodeFooter("HX2 YouTube Retrieval Intelligence")}`;
  }

  return synthesizeYouTubeRouterResult(input, routed.data);
}

