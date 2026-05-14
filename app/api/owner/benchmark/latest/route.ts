import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const file = path.join(process.cwd(), "tools", "hx2-last-benchmark.json");
    const raw = await readFile(file, "utf8");
    const data = JSON.parse(raw);

    const results = Array.isArray(data?.results) ? data.results : [];
    const weakest = [...results].sort((a, b) => Number(a?.Score ?? 0) - Number(b?.Score ?? 0))[0] || null;

    return NextResponse.json({
      ok: true,
      summary: data?.summary || {},
      results,
      weakest,
      generated_utc: data?.generated_utc || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || String(err),
        summary: {},
        results: [],
        weakest: null,
        generated_utc: null,
      },
      { status: 200 }
    );
  }
}
