import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function POST(req: Request) {
  const unauthorized = requireAuth(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const { blueprint_name, dryRun = false } = body;

    if (!blueprint_name) {
      return NextResponse.json({ error: "Missing blueprint_name" }, { status: 400 });
    }

    const mockNode = {
      name: blueprint_name,
      files: [
        { path: `nodes/${blueprint_name}/page.tsx`, contents: "export default function Page(){return 'Hello HX2';}" },
      ],
      estimatedBuildTime: "3s",
      dryRun,
    };

    return NextResponse.json({
      status: "ok",
      generated: mockNode,
      message: dryRun ? "Dry run only — no deployment triggered" : "Blueprint generated",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
