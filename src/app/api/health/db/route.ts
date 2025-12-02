import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const start = Date.now();

  try {
    // ✅ Lightweight query that doesn’t change data
    await prisma.$queryRaw`SELECT 1`;

    const duration = Date.now() - start;

    return NextResponse.json({
      status: "ok",
      latencyMs: duration,
      message: "Database reachable and responding",
      checkedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    const duration = Date.now() - start;
    return NextResponse.json(
      {
        status: "down",
        message: err.message || "Database unreachable",
        latencyMs: duration,
        checkedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
