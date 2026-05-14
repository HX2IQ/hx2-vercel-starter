import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

function safeReadJson(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function safeReadText(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) return "";
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

export async function GET(req: NextRequest) {
  try {
    const baseline = req.nextUrl.searchParams.get("baseline");

    if (!baseline) {
      return NextResponse.json(
        { ok: false, error: "Missing baseline query param" },
        { status: 400 }
      );
    }

    const root = path.join(process.cwd(), "tools", "baselines");
    const dir = path.join(root, baseline);

    if (!fs.existsSync(dir)) {
      return NextResponse.json(
        { ok: false, error: "Baseline not found" },
        { status: 404 }
      );
    }

    const detail = {
      baseline,
      path: dir,
      manifest: safeReadJson(path.join(dir, "manifest.json")),
      brain_status: safeReadJson(path.join(dir, "brain-status.json")),
      x2_baseline: safeReadJson(path.join(dir, "x2-baseline.json")),
      h2_baseline: safeReadJson(path.join(dir, "h2-baseline.json")),
      x2_mixed: safeReadJson(path.join(dir, "x2-mixed.json")),
      h2_cross: safeReadJson(path.join(dir, "h2-cross.json")),
      replies: {
        x2_baseline: safeReadText(path.join(dir, "x2-baseline.reply.txt")),
        h2_baseline: safeReadText(path.join(dir, "h2-baseline.reply.txt")),
        x2_mixed: safeReadText(path.join(dir, "x2-mixed.reply.txt")),
        h2_cross: safeReadText(path.join(dir, "h2-cross.reply.txt"))
      }
    };

    return NextResponse.json({
      ok: true,
      detail
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
