import { NextResponse } from "next/server";
import micromatch from "micromatch";

type FileError = {
  path: string;
  error: string;
};

export async function POST(req: Request) {
  const body = await req.json();

  const denyPaths = ["node_modules/**", ".next/**", ".env*"];

  const errors: FileError[] = [];
  const okFiles: string[] = [];

  for (const file of body.files ?? []) {
    const p = file.path;

    if (micromatch.isMatch(p, denyPaths)) {
      errors.push({ path: p, error: "Denied by firewall (denyPaths)" });
      continue;
    }

    okFiles.push(p);
  }

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    accepted: okFiles,
  });
}
