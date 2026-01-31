import { NextRequest, NextResponse } from "next/server";
import { route as hx2Route } from "@/src/hx2/router";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const r = hx2Route(body);

    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.BASE_URL ||
      "https://optinodeiq.com";

    const url = `${base.replace(/\/$/, "")}${r.path}`;

    const auth =
      req.headers.get("authorization") ||
      req.headers.get("Authorization") ||
      "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    };

    if (r.auth && auth) headers["Authorization"] = auth;

    const upstream = await fetch(url, {
      method: r.method,
      headers,
      body: r.method === "POST" ? JSON.stringify(body) : undefined,
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "internal_error", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
