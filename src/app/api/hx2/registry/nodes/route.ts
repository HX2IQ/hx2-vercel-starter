import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

const STORE = process.env.HX2_REGISTRY_FILE || "/tmp/hx2_registry.json";
const AUTH = process.env.HX2_API_KEY || "";

function requireAuth(req: NextRequest) {
  const h = req.headers.get("authorization") || "";
  if (!AUTH) return null;
  if (h === `Bearer ${AUTH}`) return null;
  return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" }});
}

function readStore() {
  try {
    if (!fs.existsSync(STORE)) return [];
    const txt = fs.readFileSync(STORE, "utf-8");
    return JSON.parse(txt || "[]");
  } catch (e) {
    return [];
  }
}
function writeStore(data: any) {
  try {
    fs.writeFileSync(STORE, JSON.stringify(data, null, 2));
  } catch (e) {}
}

export async function GET() {
  const nodes = readStore();
  return NextResponse.json(nodes);
}

export async function POST(req: NextRequest) {
  const denied = requireAuth(req);
  if (denied) return denied;

  try {
    const body = await req.json().catch(() => ({}));
    const nodes = readStore();
    if (Array.isArray(body)) {
      body.forEach((n) => nodes.push(n));
    } else if (body && typeof body === "object") {
      nodes.push(body);
    } else {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }
    writeStore(nodes);
    return NextResponse.json({ status: "ok", added: Array.isArray(body) ? body.length : 1 });
  } catch (err: any) {
    return NextResponse.json({ error: "add_failed", message: String(err) }, { status: 500 });
  }
}
