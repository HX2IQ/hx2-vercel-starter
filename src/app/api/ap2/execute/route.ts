import { NextRequest, NextResponse } from "next/server"
import { handleCommand } from "../lib/router"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await handleCommand(body)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message ?? "execute error" },
      { status: 500 }
    )
  }
}
