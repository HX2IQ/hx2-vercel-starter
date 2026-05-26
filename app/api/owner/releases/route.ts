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
    const root = path.join(process.cwd(), "tools", "release-notes");

    if (!fs.existsSync(root)) {
      return NextResponse.json({
        ok: true,
        releases: [],
      });
    }

    const releases = fs
      .readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith(".md"))
      .map((d) => {
        const full = path.join(root, d.name);
        const stat = fs.statSync(full);
        const text = safeReadText(full);

        return {
          file: d.name,
          path: full,
          modified_at: stat.mtime.toISOString(),
          preview: text.split(/\r?\n/).slice(0, 12).join("\n"),
        };
      })
      .sort((a, b) => (a.modified_at < b.modified_at ? 1 : -1))
      .slice(0, 10);

    return NextResponse.json({
      ok: true,
      releases,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
