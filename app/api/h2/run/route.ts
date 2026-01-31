import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Json = Record<string, any>;

function ok(data: Json, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}
function bad(error: string, status = 400, extra: Json = {}) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}

function normQuery(q: any) {
  if (typeof q !== "string") return "";
  return q.trim().slice(0, 2000);
}

function buildOutput(query: string, mode: string) {
  const lower = query.toLowerCase();

  // v1 contract: stable, UI-friendly
  if (!query || lower === "status") {
    return {
      regime: "Calm",
      summary: "H2 is online. SAFE contract v1. No external intel sources queried.",
      signals: [
        { key: "connectivity", level: "green", note: "API reachable" },
        { key: "adapters", level: "yellow", note: "OSINT/web adapters disabled (SAFE)" }
      ],
      next_actions: [
        "Wire /oi/h2 UI to POST /api/h2/run and render cards.",
        "Add schema validation + rate limiting.",
        "Add owner-only adapter toggles (web/osint) later."
      ]
    };
  }

  // echo mode (useful for UI + debugging)
  if (lower.startsWith("echo:")) {
    const text = query.slice(5).trim();
    return {
      regime: "Calm",
      summary: "Echo response (SAFE).",
      signals: [{ key: "mode", level: "green", note: mode }],
      echo: { text, length: text.length }
    };
  }

  // capabilities / adapters (future-proof contract)
  if (lower === "caps" || lower === "capabilities") {
    return {
      regime: "Calm",
      summary: "Capabilities (SAFE).",
      adapters: {
        web_search: false,
        osint: false,
        rss: false,
        markets: false
      }
    };
  }

  // default placeholder for any other query
  return {
    regime: "Calm",
    summary: "SAFE placeholder response contract. No external intel sources were queried.",
    signals: [{ key: "mode", level: "green", note: mode }],
    input_echo: query,
    next_actions: ["Add adapters behind owner-only gating when ready."]
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: Json = await req.json().catch(() => ({}));
    const mode = String(body.mode ?? "SAFE");
    const query = normQuery(body.query ?? body.input?.query ?? body.q);

    const output = buildOutput(query, mode);

    return ok({
      service: "h2",
      endpoint: "/api/h2/run",
      result: {
        node: "h2-oi",
        mode,
        input: { query },
        output
      },
      ts: new Date().toISOString()
    });
  } catch (e: any) {
    return bad("h2_run_failed", 500, { message: e?.message ?? String(e) });
  }
}
