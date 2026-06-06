import { NextResponse } from "next/server";
import { buildKgxAdaptiveNodeSelection } from "../_lib/kgx-adaptive-node-selection";
import { recallKgxPipelines } from "../_lib/kgx-pipeline-recall";
import { buildKgxPipelineAnalytics } from "../_lib/kgx-pipeline-analytics";
import { buildKgxPipelineLineage } from "../_lib/kgx-pipeline-lineage";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const q =
      url.searchParams.get("q") ||
      url.searchParams.get("query") ||
      "";

    const capabilityPlanId =
      url.searchParams.get("capabilityPlanId") ||
      undefined;

    const routing = q
      ? await buildKgxAdaptiveNodeSelection(q)
      : null;

    const recall = await recallKgxPipelines(10);
    const analytics = await buildKgxPipelineAnalytics();
    const lineage = await buildKgxPipelineLineage(capabilityPlanId);

    return NextResponse.json({
      ok: true,
      kgx_pipeline_preview_active: true,
      routing,
      recall,
      analytics,
      lineage
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "pipeline preview failed"
      },
      { status: 500 }
    );
  }
}
