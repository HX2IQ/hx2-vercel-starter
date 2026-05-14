import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function getJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return await res.json();
}

export async function GET() {
  try {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://optinodeiq.com";

    const policy = await getJson(`${base}/api/owner/o2-autopilot-policy`);
    const chainData = await getJson(`${base}/api/owner/o2-chain`);

    if (!policy || !chainData) {
      return NextResponse.json(
        { ok: false, error: "Missing policy or chain data" },
        { status: 500 }
      );
    }

    const nextStep =
      (chainData?.chain || []).find((x: any) => x.status === "ready") || null;

    const eligible =
      !!policy?.enabled &&
      chainData?.state === "green" &&
      !!nextStep &&
      (policy?.safe_actions || []).includes(nextStep.action);

    return NextResponse.json({
      ok: true,
      eligible,
      state: chainData?.state || "unknown",
      next_step: nextStep,
      mode: policy?.mode || "unknown",
      enabled: !!policy?.enabled,
      reason: eligible
        ? "Safe auto-run is eligible."
        : !policy?.enabled
        ? "Autopilot is disabled."
        : chainData?.state !== "green"
        ? "O2 state is not green."
        : !nextStep
        ? "No ready step available."
        : "Next step is not in safe allowlist."
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
