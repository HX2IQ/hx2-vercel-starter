import { NextResponse } from "next/server";
import { routeCommand } from "@/app/lib/console/commandRouter";

export async function POST(req: Request) {
  const payload = await req.json();
  const result = await routeCommand(payload);
  return NextResponse.json(result);
}
