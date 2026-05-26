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
    const decision = await getJson(`${base}/api/owner/o2-autopilot-decision`);

    if (!policy || !decision) {
      return NextResponse.json(
        { ok: false, error: "Missing autopilot policy or decision data" },
        { status: 500 }
      );
    }

    const nextStep = decision?.next_step || null;
    const eligible = !!decision?.eligible;

    const plan = eligible && nextStep
      ? {
          would_run: true,
          action: nextStep.action,
          label: nextStep.label,
          reason: decision?.reason || "Eligible safe step detected.",
          checks: {
            autopilot_enabled: !!policy?.enabled,
            green_state_required: !!policy?.rules?.require_green_state,
            ready_step_required: !!policy?.rules?.require_ready_step,
            owner_enable_required: !!policy?.rules?.require_owner_enable,
            safe_allowlist_match: (policy?.safe_actions || []).includes(nextStep.action),
          }
        }
      : {
          would_run: false,
          action: null,
          label: null,
          reason: decision?.reason || "No eligible safe step.",
          checks: {
            autopilot_enabled: !!policy?.enabled,
            green_state_required: !!policy?.rules?.require_green_state,
            ready_step_required: !!policy?.rules?.require_ready_step,
            owner_enable_required: !!policy?.rules?.require_owner_enable,
            safe_allowlist_match: false,
          }
        };

    return NextResponse.json({
      ok: true,
      mode: policy?.mode || "unknown",
      enabled: !!policy?.enabled,
      eligible,
      dry_run: plan
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
