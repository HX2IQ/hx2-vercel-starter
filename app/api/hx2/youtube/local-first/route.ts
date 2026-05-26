import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { classifyQuery, getMinLocalMatchScore, getMinLocalQualityScore, getMinSaveScore } from "../../_lib/query-intelligence";
import { countTokenOverlap } from "../../_lib/resource-scoring";
import { filterLocalResults } from "../../_lib/local-filtering";

export const runtime = "nodejs";

const MAX_YOUTUBE_RESOURCE_TRANSCRIPT_BYTES = 250000;

async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  return { ok: res.ok, status: res.status, data };
}


function getRedisClient() {
  const url = String(
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    ""
  ).trim();

  const token = String(
    process.env.KV_REST_API_TOKEN ||
    process.env.KV_REST_API_READ_ONLY_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    ""
  ).trim();

  if (!url || !token) return null;
  return new Redis({ url, token });
}

function clean(s: unknown) {
  return String(s || "").trim();
}




function clampTranscript(text: string) {
  const s = clean(text);
  return s.length > MAX_YOUTUBE_RESOURCE_TRANSCRIPT_BYTES
    ? s.slice(0, MAX_YOUTUBE_RESOURCE_TRANSCRIPT_BYTES)
    : s;
}

function tokenize(q: string) {
  return clean(q)
    .toLowerCase()
    .split(/\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function scoreYouTubeResult(result: any, query: string) {
  const q = clean(query).toLowerCase();
  const title = clean(result?.title).toLowerCase();
  const snippet = clean(result?.snippet).toLowerCase();

  let score = 0;

  for (const tok of tokenize(q)) {
    if (title.includes(tok)) score += 3;
    if (snippet.includes(tok)) score += 1;
  }

  if (title.includes("review")) score += 2;
  if (title.includes("koenig")) score += 2;
  if (snippet.includes("koenig")) score += 1;
  if (title.includes(q)) score += 10;
  if (snippet.includes(q)) score += 5;

  return score;
}


function getYouTubeResourceItemKey(videoId: string) {
  return `hx2:youtube:resource:${videoId}`;
}

function getYouTubeResourceIndexKey() {
  return "hx2:youtube:resources:index";
}

async function saveYouTubeResource(item: any) {
  const redis = getRedisClient();
  if (!redis) return;

  const videoId = clean(item?.video_id);
  if (!videoId) return;

  const transcriptText = clampTranscript(item?.transcript_text || "");

  const normalized = {
    type: "youtube_resource",
    video_id: videoId,
    title: clean(item?.title),
    url: clean(item?.url),
    source: clean(item?.source || "youtube"),
    query: clean(item?.query),
    excerpt: clean(item?.excerpt),
    transcript_available: !!item?.transcript_available,
    transcript_text: transcriptText,
    transcript_chars: transcriptText.length,
    quality_score: typeof item?.quality_score === "number" ? item.quality_score : null,
    saved_at: clean(item?.saved_at || new Date().toISOString()),
  };

  await redis.set(getYouTubeResourceItemKey(videoId), normalized);

  const existing = await redis.get(getYouTubeResourceIndexKey());
  const ids = Array.isArray(existing)
    ? existing.map((x: any) => clean(x)).filter(Boolean)
    : [];

  if (!ids.includes(videoId)) {
    ids.unshift(videoId);
  }

  await redis.set(getYouTubeResourceIndexKey(), ids.slice(0, 500));
}





export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const q = clean(body?.q || body?.query || body?.text || body?.message);
    const queryClassification = classifyQuery(q);
    const limitRaw = Number(body?.limit ?? 5);
    const limit = Math.max(1, Math.min(10, Number.isFinite(limitRaw) ? limitRaw : 5));

    if (!q) {
      return NextResponse.json({ ok: false, error: "missing q" }, { status: 400 });
    }

    const baseUrl =
      process.env.BASE_URL ||
      req.nextUrl.origin ||
      "https://optinodeiq.com";

    const savedYt = await postJson(baseUrl + "/api/hx2/youtube/resources/search", {
      q,
      limit,
    });

    const localResults = savedYt?.data?.ok && Array.isArray(savedYt?.data?.results)
      ? savedYt.data.results
      : [];
    const MIN_LOCAL_YOUTUBE_SCORE = getMinLocalMatchScore(q);
    const MIN_LOCAL_QUALITY_SCORE = getMinLocalQualityScore(q);
    const MIN_LOCAL_TOKEN_OVERLAP = 1;
    const filteredLocalResults = filterLocalResults({
      query: q,
      results: localResults,
      minMatchScore: MIN_LOCAL_YOUTUBE_SCORE,
      minQualityScore: MIN_LOCAL_QUALITY_SCORE,
      minTokenOverlap: MIN_LOCAL_TOKEN_OVERLAP,
      getTokenOverlap: countTokenOverlap,
    });

    if (savedYt?.data?.ok && filteredLocalResults.length > 0) {
      const localChosen = filteredLocalResults[0] || null;

      // --- AUTO-UPGRADE TRANSCRIPT (safe, non-blocking fallback) ---
      let autoUpgradeAttempted = false;
      let upgradedItem: any = null;

      if (localChosen && !localChosen?.transcript_available && localChosen?.video_id) {
        try {
          autoUpgradeAttempted = true;

          const upgradeRes = await postJson(baseUrl + "/api/hx2/youtube/resources/upgrade", {
            video_id: localChosen.video_id,
          });

          if (upgradeRes?.data?.ok && upgradeRes?.data?.upgraded && upgradeRes?.data?.item) {
            upgradedItem = upgradeRes.data.item;
          }
        } catch {}
      }

      const finalChosen = upgradedItem || localChosen;
      const finalResults = upgradedItem ? [upgradedItem, ...filteredLocalResults.slice(1)] : filteredLocalResults;

      return NextResponse.json({
        ok: true,
        source: "youtube_local",
          min_local_match_score_used: MIN_LOCAL_YOUTUBE_SCORE,
          min_local_quality_score_used: MIN_LOCAL_QUALITY_SCORE,
          min_local_token_overlap_used: MIN_LOCAL_TOKEN_OVERLAP,
          query_classification: queryClassification,
        search: {
          ok: true,
          provider: "local_youtube_resources",
          q,
          n: localResults.length,
          results: finalResults,
        },
        transcript: finalChosen?.transcript_available ? {
          ok: true,
          video_id: localChosen?.video_id || "",
          n: 0,
          transcript: [],
          full_text: clean(localChosen?.transcript_text),
          excerpt: clean(localChosen?.excerpt),
        } : null,
        chosen_video: finalChosen,
      });
    }

    const ytSearch = await postJson(baseUrl + "/api/hx2/youtube/search", {
      q,
      limit,
    });

    if (!ytSearch?.data?.ok || !Array.isArray(ytSearch?.data?.results)) {
      return NextResponse.json({
        ok: false,
        error: "youtube search failed",
        source: "youtube_live",
      }, { status: 502 });
    }

    const rankedResults = [...ytSearch.data.results]
      .map((r: any) => ({ ...r, _score: scoreYouTubeResult(r, q) }))
      .sort((a: any, b: any) => Number(b?._score || 0) - Number(a?._score || 0))
      .slice(0, limit);

    const chosen = rankedResults[0] || null;
    const MIN_SAVE_SCORE = getMinSaveScore(q);
    let savedToLocal = false;
    let saveReason = "not_attempted";

    if (!chosen?.video_id) {
      saveReason = "missing_video_id";
    } else if (Number(chosen?._score || 0) < MIN_SAVE_SCORE) {
      saveReason = "score_below_threshold";
    } else {
      try {
        await saveYouTubeResource({
          video_id: clean(chosen?.video_id),
          title: clean(chosen?.title),
          url: clean(chosen?.url),
          source: clean(chosen?.source || "youtube"),
          query: q,
          excerpt: clean(chosen?.snippet),
          transcript_available: false,
          transcript_text: "",
          quality_score: typeof chosen?._score === "number" ? chosen._score : null,
          saved_at: new Date().toISOString(),
        });
        savedToLocal = true;
        saveReason = "score_above_threshold";
      } catch {
        saveReason = "save_failed";
      }
    }

    return NextResponse.json({
      ok: true,
      source: "youtube_live",
      saved_to_local: savedToLocal,
      save_reason: saveReason,
      min_save_score_used: MIN_SAVE_SCORE,
      query_classification: queryClassification,
      search: {
        ...ytSearch.data,
        results: rankedResults,
      },
      transcript: null,
      chosen_video: chosen,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}

















