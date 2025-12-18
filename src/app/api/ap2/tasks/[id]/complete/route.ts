import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { state, error } = body;

  if (!["completed", "failed"].includes(state)) {
    return NextResponse.json(
      { error: "Invalid state" },
      { status: 400 }
    );
  }

  await prisma.ap2Task.update({
    where: { id: params.id },
    data: {
      state,
      ...(error ? { error } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
