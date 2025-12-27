import { NextResponse } from "next/server"
import { routeCommand } from "../lib/router"

export async function POST(req: Request) {
  const body = await req.json()
  const command = body.command

  if (!command) {
    return NextResponse.json({
      ok: false,
      error: "Missing command"
    }, { status: 400 })
  }

  const result = await routeCommand(command)
  return NextResponse.json(result)
}
