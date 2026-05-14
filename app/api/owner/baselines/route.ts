import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

function readJson(filePath: string) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function testBaselineComplete(dir: string) {
  const required = [
    "brain-status.json",
    "x2-baseline.json",
    "x2-baseline.reply.txt",
    "h2-baseline.json",
    "h2-baseline.reply.txt",
    "x2-mixed.json",
    "x2-mixed.reply.txt",
    "h2-cross.json",
    "h2-cross.reply.txt",
    "manifest.json",
  ];

  return required.every((name) => fs.existsSync(path.join(dir, name)));
}

export async function GET() {
  try {
    const root = path.join(process.cwd(), "tools", "baselines");

    if (!fs.existsSync(root)) {
      return NextResponse.json({ ok: true, baselines: [], stability: {} });
    }

    const dirs = fs
      .readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== "_incomplete" && d.name !== "_staging")
      .map((d) => d.name)
      .sort()
      .reverse()
      .filter((dir) => testBaselineComplete(path.join(root, dir)))
      .slice(0, 20);

    const baselines = dirs.map((dir) => {
      const full = path.join(root, dir);
      const x2 = readJson(path.join(full, "x2-baseline.json"));
      const h2 = readJson(path.join(full, "h2-baseline.json"));

      return {
        baseline: dir,
        path: full,
        x2_anchor: x2?.anchor_source || null,
        h2_anchor: h2?.anchor_source || null,
        x2_direct_count: x2?.catalyst_summary?.direct_catalysts?.length ?? 0,
        h2_direct_count: h2?.catalyst_summary?.direct_catalysts?.length ?? 0,
        x2_indirect_count: x2?.catalyst_summary?.indirect_backdrop?.length ?? 0,
        x2_narrative_count: x2?.catalyst_summary?.narrative_support?.length ?? 0,
        h2_narrative_count: h2?.catalyst_summary?.narrative_support?.length ?? 0,
      };
    });

    const recent = baselines.slice(0, 5);
    const x2Unique = [...new Set(recent.map((x) => x.x2_anchor).filter(Boolean))];
    const h2Unique = [...new Set(recent.map((x) => x.h2_anchor).filter(Boolean))];

    return NextResponse.json({
      ok: true,
      baselines,
      stability: {
        window_size: recent.length,
        x2_anchor_unique_count: x2Unique.length,
        h2_anchor_unique_count: h2Unique.length,
        x2_anchor_stable: x2Unique.length <= 1,
        h2_anchor_stable: h2Unique.length <= 1,
        x2_anchor_values: x2Unique,
        h2_anchor_values: h2Unique,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
