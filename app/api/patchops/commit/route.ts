import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type PatchFile = {
  path: string;     // e.g. "app/api/chat/send/route.ts"
  content: string;  // full file content
};

function okPath(p: string) {
  const path = String(p || "").replace(/\\/g, "/").trim();
  if (!path) return false;
  // Allow only repo files we expect to edit (tight allowlist)
  const allowedPrefixes = [
    "app/",
    "tools/",
    "components/",
    "lib/",
    "public/",
    "styles/",
    "prisma/",
  ];
  if (!allowedPrefixes.some(pref => path.startsWith(pref))) return false;

  // Block dangerous / sensitive files
  const blocked = [
    ".env", ".env.", ".vercel", "node_modules/", ".git/",
    "package-lock.json", "pnpm-lock.yaml", "yarn.lock"
  ];
  if (blocked.some(b => path.startsWith(b) || path.includes(b))) return false;

  return true;
}

async function ghGetJson(url: string, token: string) {
  const r = await fetch(url, {
    method: "GET",
    headers: {
      "accept": "application/vnd.github+json",
      "authorization": `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      "user-agent": "HX2-PatchOps/1.0",
    },
    cache: "no-store",
  });
  const j = await r.json().catch(() => null);
  return { ok: r.ok, status: r.status, json: j };
}

async function ghPutJson(url: string, token: string, body: any) {
  const r = await fetch(url, {
    method: "PUT",
    headers: {
      "accept": "application/vnd.github+json",
      "authorization": `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      "content-type": "application/json",
      "user-agent": "HX2-PatchOps/1.0",
    },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => null);
  return { ok: r.ok, status: r.status, json: j };
}

export async function POST(req: NextRequest) {
  const started_at = new Date().toISOString();

  try {
    const token = process.env.HX2_GITHUB_TOKEN || "";
    const repo = process.env.HX2_GITHUB_REPO || "";
    const key  = process.env.HX2_PATCHOPS_KEY || "";

    // Auth: require x-patchops-key header
    const k = req.headers.get("x-patchops-key") || "";
    if (!key || k !== key) {
      return NextResponse.json({ ok: false, error: "unauthorized", started_at }, { status: 401 });
    }

    if (!token || !repo || !repo.includes("/")) {
      return NextResponse.json({ ok: false, error: "missing HX2_GITHUB_TOKEN or HX2_GITHUB_REPO", started_at }, { status: 500 });
    }

    const body = await req.json().catch(() => ({} as any));
    const branch = String(body?.branch || "main");
    const message = String(body?.message || "patchops: update files").slice(0, 200);

    const files: PatchFile[] = Array.isArray(body?.files) ? body.files : [];
    if (!files.length) {
      return NextResponse.json({ ok: false, error: "missing files[]", started_at }, { status: 400 });
    }

    // Validate file list
    for (const f of files) {
      if (!okPath(f?.path)) {
        return NextResponse.json({ ok: false, error: `blocked path: ${String(f?.path || "")}`, started_at }, { status: 400 });
      }
      const content = String(f?.content ?? "");
      if (content.length < 1) {
        return NextResponse.json({ ok: false, error: `empty content for: ${String(f?.path || "")}`, started_at }, { status: 400 });
      }
      if (content.length > 750_000) {
        return NextResponse.json({ ok: false, error: `file too large: ${String(f?.path || "")}`, started_at }, { status: 400 });
      }
    }

    const [owner, name] = repo.split("/", 2);
    const results: any[] = [];

    for (const f of files) {
      const path = String(f.path).replace(/\\/g, "/").trim();
      const api = `https://api.github.com/repos/${owner}/${name}/contents/${encodeURIComponent(path)}`;

      // Get current SHA if file exists
      const cur = await ghGetJson(`${api}?ref=${encodeURIComponent(branch)}`, token);
      const sha = cur.ok ? String(cur.json?.sha || "") : "";

      const contentB64 = Buffer.from(String(f.content), "utf8").toString("base64");

      const putBody: any = {
        message,
        content: contentB64,
        branch,
      };
      if (sha) putBody.sha = sha;

      const put = await ghPutJson(api, token, putBody);

      results.push({
        path,
        updated: put.ok,
        status: put.status,
        commit: put.json?.commit?.sha || null,
        url: put.json?.content?.html_url || null,
        error: put.ok ? null : (put.json?.message || "unknown"),
      });

      if (!put.ok) {
        return NextResponse.json(
          { ok: false, error: "github update failed", started_at, results },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { ok: true, started_at, branch, message, results },
      { status: 200, headers: { "x-patchops": "commit-v1" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e), started_at },
      { status: 500 }
    );
  }
}