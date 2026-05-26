import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(v?: string | null) {
  return (v || "").toString().trim().replace(/^"+|"+$/g, "");
}

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

function fail(error: string, status = 500) {
  return json(
    { ok: false, service: "intelligence-oi", error, ts: new Date().toISOString() },
    status
  );
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.max(1, Math.min(Number(url.searchParams.get("limit") || "20"), 100));

    const base =
      clean(process.env.NEXT_PUBLIC_SITE_URL) ||
      clean(process.env.NEXT_PUBLIC_BASE_URL) ||
      "https://optinodeiq.com";

    const hx2Key = clean(process.env.HX2_API_KEY);
    if (!hx2Key) return fail("HX2_API_KEY missing", 500);

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${hx2Key}`,
      "Content-Type": "application/json"
    };

    const enqueueBody = {
      task: "intelligence.recent",
      mode: "SAFE",
      payload: { limit }
    };

    const enqRes = await fetch(`${base}/api/ap2/task/enqueue`, {
      method: "POST",
      headers,
      body: JSON.stringify(enqueueBody),
      cache: "no-store"
    });

    const enqJson = await enqRes.json().catch(() => null);
    const taskId = enqJson?.task?.id;

    if (!enqRes.ok || !taskId) {
      return fail(`enqueue failed: ${JSON.stringify(enqJson || {}).slice(0, 300)}`, 502);
    }

    for (let i = 0; i < 20; i++) {
      await sleep(500);

      const stRes = await fetch(
        `${base}/api/ap2/task/status?taskId=${encodeURIComponent(taskId)}`,
        {
          method: "GET",
          headers: { "Authorization": `Bearer ${hx2Key}` },
          cache: "no-store"
        }
      );

      const stJson = await stRes.json().catch(() => null);

      if (stJson?.state === "COMPLETED") {
        return json({
          ok: true,
          service: "intelligence-oi",
          via: "ap2",
          taskId,
          ...(stJson.result || {}),
          ts: new Date().toISOString()
        });
      }

      if (stJson?.state === "FAILED") {
        return fail(stJson?.error || "intelligence.recent failed", 502);
      }
    }

    return fail("Timed out waiting for intelligence.recent", 504);
  } catch (err: any) {
    return fail(err?.message || String(err), 500);
  }
}
