import { NextResponse } from "next/server";
import { recallKgxContextualPipelines } from "../_lib/kgx-contextual-pipeline-recall";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {

  const url = new URL(req.url);

  const tag =
    url.searchParams.get("tag") || undefined;

  const recall =
    await recallKgxContextualPipelines(tag);

  return NextResponse.json({
    ok: true,
    kgx_contextual_pipeline_recall_active: true,
    recall
  });
}
