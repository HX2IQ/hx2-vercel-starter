import { NextResponse } from "next/server"
import { runAp2Command } from "../_lib/router"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body?.command) {
      return NextResponse.json(
        { ok: false, error: "Missing command" },
        { status: 400 }
      )
    }

    const result = await runAp2Command(body)

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unhandled error" },
      { status: 500 }
    )
  }
}
