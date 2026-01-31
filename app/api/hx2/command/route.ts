import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Route = { path: string; method: "GET" | "POST"; auth?: boolean };

function resolve(cmd: any): Route {
  const c = String(cmd?.command || "").trim();

  switch (c) {
    // Core
    case "hx2.status":
      return { path: "/api/hx2_base", method: "GET", auth: true };

    case "registry.list":
      return { path: "/api/hx2_registry", method: "GET", auth: false };

    // AP2
    case "ap2.status":
      return { path: "/api/ap2/status", method: "POST", auth: true };

    case "ap2.enqueue":
      return { path: "/api/ap2/task/enqueue", method: "POST", auth: true };

    case "ap2.task.status":
      return { path: "/api/ap2/task/status", method: "POST", auth: true };

    // Brain (explicit)
    case "brain.run":
      return { path: "/api/brain/run", method: "POST", auth: true };

    default:
      return { path: "/api/hx2_unknown", method: "POST", auth: true };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const route = resolve(body);

    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.BASE_URL ||
      "https://optinodeiq.com";

    const url = `${base.replace(/\/$/, "")}${route.path}`;

    const auth =
      req.headers.get("authorization") ||
      req.headers.get("Authorization") ||
      "";

    const headers: Record<string, string> = {
      "Cache-Control": "no-store",
    };
    if (route.method !== "GET") headers["Content-Type"] = "application/json";
    if (route.auth && auth) headers["Authorization"] = auth;

    const r = await fetch(url, {
      method: route.method,
      headers,
      body: route.method === "GET" ? undefined : JSON.stringify(body),
    });

    const text = await r.text();
    return new NextResponse(text, {
      status: r.status,
      headers: {
        "Content-Type": r.headers.get("content-type") || "application/json",
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
