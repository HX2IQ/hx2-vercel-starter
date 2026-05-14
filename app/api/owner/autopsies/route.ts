import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

function safeReadText(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) return "";
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

export async function GET() {
  try {
    const root = path.join(process.cwd(), "tools", "_autopsy");

    if (!fs.existsSync(root)) {
      return NextResponse.json({
        ok: true,
        autopsies: [],
      });
    }

    const dirs = fs
      .readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()
      .reverse()
      .slice(0, 10);

    const autopsies = dirs.map((dir) => {
      const full = path.join(root, dir);
      const summaryPath = path.join(full, "summary.txt");
      const deployLogPath = path.join(full, "deploy.log");
      const baselineDiffPath = path.join(full, "baseline-diff.txt");
      const regressionPath = path.join(full, "regression.txt");

      const summaryText = safeReadText(summaryPath);
      let reason = "";

      const m = summaryText.match(/Reason:\s*(.+)/i);
      if (m) reason = m[1].trim();

      return {
        folder: dir,
        path: full,
        reason: reason || "unknown",
        summary_preview: summaryText.split(/\r?\n/).slice(0, 12).join("\n"),
        files: {
          summary: fs.existsSync(summaryPath) ? summaryPath : null,
          deploy_log: fs.existsSync(deployLogPath) ? deployLogPath : null,
          baseline_diff: fs.existsSync(baselineDiffPath) ? baselineDiffPath : null,
          regression: fs.existsSync(regressionPath) ? regressionPath : null,
        },
      };
    });

    return NextResponse.json({
      ok: true,
      autopsies,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
