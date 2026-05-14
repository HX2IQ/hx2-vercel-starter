import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "tools", "markers", "postflight-history.jsonl");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ ok: true, postflights: [] });
    }

    const lines = fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(-20)
      .reverse();

    const postflights = lines.map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({
      ok: true,
      postflights,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
