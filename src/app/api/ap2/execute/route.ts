import { NextResponse } from "next/server";
import { commandRegistry } from "../lib/registry";

export async function POST(req: Request) {
  const body = await req.json();
  const { command } = body;

  const handler = commandRegistry[command];

  if (!handler) {
    return NextResponse.json({
      ok: false,
      error: `Unknown command: ${command}`
    });
  }

  const result = await handler(body);
  return NextResponse.json(result);
}
