import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  const unauthorized = requireAuth(req);
  if (unauthorized) return unauthorized;

  // Example static list — replace with DB lookup later
  const nodes = [
    { name: "Hello", slug: "/hello", version: "0.0.1", health: "ok" },
    { name: "HX2 Core", slug: "/", version: "2.1.0", health: "ok" },
  ];

  return NextResponse.json({
    status: "ok",
    count: nodes.length,
    nodes,
  });
}
