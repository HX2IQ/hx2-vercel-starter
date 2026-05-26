import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function getChain(base: string) {
  const res = await fetch(`${base}/api/owner/o2-chain`, { cache: "no-store" });
  if (!res.ok) return { chain: [] };
  return await res.json();
}

export async function GET() {
  try {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://optinodeiq.com";

    const chainData = await getChain(base);
    const chain = chainData?.chain || [];

    const nextStep =
      chain.find((x: any) => x.status === "ready" || x.status === "required") ||
      null;

    return NextResponse.json({
      ok: true,
      next_step: nextStep,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
