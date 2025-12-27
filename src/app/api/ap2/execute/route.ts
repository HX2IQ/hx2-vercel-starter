import { NextResponse } from "next/server";
import { routeCommand } from "../lib/router";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await routeCommand(body.command);
  return NextResponse.json(result);
}
