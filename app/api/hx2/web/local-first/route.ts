import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { classifyQuery, getMinLocalMatchScore, getMinLocalQualityScore, getMinSaveScore } from "../../_lib/query-intelligence";
import { scoreLiveWebResult } from "../../_lib/resource-scoring";
import { filterLocalResults } from "../../_lib/local-filtering";

export const runtime = "nodejs";

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

function clean(s: unknown) {
  return String(s || "").trim();
}

function shouldForceLiveSearch(query: string) {
  const q = clean(query).toLowerCase();

  return /\b(latest|current|today|news|recent|update|search|look up|verify|source|sources|fresh|new|2026)\b/.test(q);
}



function getRedisClient() {
  const url = String(process.env.UPSTASH_REDIS_REST_URL || "").trim();
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getWebResourceItemKey(id: string) {
  return `hx2:web:resource:item:${id}`;
}

function getWebResourceIdsKey() {
  return "hx2:web:resource:ids";
}

async function saveWebResource(item: any) {
  const redis = getRedisClient();
  if (!redis) return;

  const url = clean(item?.url);
  if (!url) return;

  const normalized = {
    type: "web_resource",
    url,
    title: clean(item?.title),
    source: clean(item?.source || "web"),
    query: clean(item?.query),
    snippet: clean(item?.snippet),
    quality_score: typeof item?.quality_score === "number" ? item.quality_score : null,
    saved_at: clean(item?.saved_at || new Date().toISOString()),
  };

  await redis.set(getWebResourceItemKey(url), normalized);
  await redis.sadd(getWebResourceIdsKey(), url);
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const q = clean(body?.q || body?.query || body?.text || body?.message);
    const limitRaw = Number(body?.limit ?? 5);
    const limit = Math.max(1, Math.min(10, Number.isFinite(limitRaw) ? limitRaw : 5));

    if (!q) {
      return NextResponse.json({ ok: false, error: "missing q" }, { status: 400 });
    }

    const queryClassification = classifyQuery(q);
    const FORCE_LIVE_SEARCH = shouldForceLiveSearch(q);
    const MIN_LOCAL_MATCH_SCORE = getMinLocalMatchScore(q);
    const MIN_LOCAL_QUALITY_SCORE = getMinLocalQualityScore(q);

    const baseUrl =
      process.env.BASE_URL ||
      req.nextUrl.origin ||
      "https://optinodeiq.com";

    const localWeb = await postJson(baseUrl + "/api/hx2/search/resources/search", {
      q,
      limit,
    });

    const localResults = localWeb?.data?.ok && Array.isArray(localWeb?.data?.results)
      ? localWeb.data.results
      : [];

    const filteredLocalResults = filterLocalResults({
      query: q,
      results: localResults,
      minMatchScore: MIN_LOCAL_MATCH_SCORE,
      minQualityScore: MIN_LOCAL_QUALITY_SCORE,
    });

    if (!FORCE_LIVE_SEARCH && localWeb?.data?.ok && filteredLocalResults.length > 0) {
      const localChosen = filteredLocalResults[0] || null;

      return NextResponse.json({
        ok: true,
        source: "web_local",
        min_local_match_score_used: MIN_LOCAL_MATCH_SCORE,
        min_local_quality_score_used: MIN_LOCAL_QUALITY_SCORE,
        query_classification: queryClassification,
        search: {
          ok: true,
          provider: "local_web_resources",
          q,
          n: filteredLocalResults.length,
          results: filteredLocalResults,
        },
        chosen_result: localChosen,
      });
    }

    const liveWeb = await postJson(baseUrl + "/api/hx2/search", {
      q,
      category: "general",
      limit,
    });

    if (!liveWeb?.data?.ok || !Array.isArray(liveWeb?.data?.results)) {
      return NextResponse.json({
        ok: false,
        error: "web search failed",
        source: "web_live",
      }, { status: 502 });
    }

    const chosen = liveWeb.data.results[0] || null;
    const chosenLiveScore = scoreLiveWebResult(q, chosen);
    const MIN_SAVE_SCORE = getMinSaveScore(q);
    let savedToLocal = false;
    let saveReason = "not_attempted";


    if (!chosen?.url) {
      saveReason = "missing_url";
    } else if (chosenLiveScore < MIN_SAVE_SCORE) {
      saveReason = "score_below_threshold";
    } else {
      try {
        await saveWebResource({
          url: clean(chosen?.url),
          title: clean(chosen?.title),
          source: clean(chosen?.source || "web"),
          query: q,
          snippet: clean(chosen?.snippet),
          quality_score: chosenLiveScore,
          saved_at: new Date().toISOString(),
        });
        savedToLocal = true;
        saveReason = "score_above_threshold";
      } catch {
        saveReason = "save_failed";
      }
    }


    if (queryClassification === "price_lookup" && chosen?.url) {
    }

    return NextResponse.json({
      ok: true,
      source: "web_live",
      forced_live_search: FORCE_LIVE_SEARCH,
      saved_to_local: savedToLocal,
      save_reason: saveReason,
      min_save_score_used: MIN_SAVE_SCORE,
      chosen_live_score: chosenLiveScore,
      query_classification: queryClassification,
      search: liveWeb.data,
      chosen_result: chosen,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}










