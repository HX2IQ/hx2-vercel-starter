function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  if (process.env.VERCEL_URL) {
    return process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

async function postJson(path: string, body: any, fallback: any) {
  try {
    const base = getBaseUrl();

    const res = await fetch(`${base}${path}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      return { ...fallback, ok: false, error: `HTTP ${res.status}` };
    }

    return await res.json();
  } catch (err: any) {
    return {
      ...fallback,
      ok: false,
      error: err?.message || "planner preview fetch failed"
    };
  }
}

function PlannerStat({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-xl font-semibold text-white">{String(value)}</div>
    </div>
  );
}

async function getCapabilityPlannerMemory() {
  try {
    const base = getBaseUrl();

    const res = await fetch(`${base}/api/hx2/capability-planner-memory`, {
      method: "GET",
      cache: "no-store"
    });

    if (!res.ok) {
      return {
        ok: false,
        memory_count: 0,
        escalation_count: 0,
        pipeline_execution_count: 0,
        memory: []
      };
    }

    return await res.json();
  } catch {
    return {
      ok: false,
      memory_count: 0,
      escalation_count: 0,
      pipeline_execution_count: 0,
      memory: []
    };
  }
}

async function getCapabilityPlannerPreview() {
  return postJson(
    "/api/hx2/capability-planner",
    {
      message: "Analyze XRP market conditions with risk and narrative context"
    },
    {
      ok: false,
      intent: "unknown",
      selected_node: "unknown",
      candidate_nodes: [],
      execution_mode: "unknown",
      escalation: {},
      orchestration_synthesis: {},
      execution_pipeline: []
    }
  );
}

export async function CapabilityPlannerPreviewPanel() {
  const data = await getCapabilityPlannerPreview();
  const memoryData = await getCapabilityPlannerMemory();

  const learning =
    memoryData?.learning_signals || {};

  const nodeFrequency =
    learning?.node_frequency || {};

  const nodeReliability =
    learning?.node_reliability || {};

  const modeFrequency =
    learning?.execution_mode_frequency || {};

  const sprintRecommendation =
    memoryData?.sprint_recommendation || {};

  const candidates = data?.candidate_nodes || [];
  const synthesis = data?.orchestration_synthesis || {};
  const escalation = data?.escalation || {};

  const plannerFeedback =
    data?.planner_feedback || {};

  const selectionExplanation =
    data?.selection_explanation || "No explanation available.";
  const pipeline = data?.execution_pipeline || [];

  return (
    <div className="mt-4 rounded-2xl border border-cyan-800 bg-slate-900 p-5">
      <div>
        <h2 className="text-lg font-semibold">Capability Planner Preview</h2>
        <p className="mt-1 text-sm text-slate-400">
          Live orchestration intelligence preview: intent, node scoring, execution mode, escalation, and synthesis.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <PlannerStat title="Planner API" value={data?.ok ? "Available" : "Issue"} />
        <PlannerStat title="Intent" value={data?.intent || "unknown"} />
        <PlannerStat title="Selected Node" value={data?.selected_node || "unknown"} />
        <PlannerStat title="Execution Mode" value={data?.execution_mode || "unknown"} />
        <PlannerStat title="Escalated" value={escalation?.escalated ? "true" : "false"} />
        <PlannerStat title="Pipeline Steps" value={pipeline.length} />
        <PlannerStat title="Memory Records" value={memoryData?.memory_count ?? 0} />
        <PlannerStat title="Escalation Count" value={memoryData?.escalation_count ?? 0} />
        <PlannerStat title="Pipeline Runs" value={memoryData?.pipeline_execution_count ?? 0} />
      </div>

      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
        <div className="text-sm font-semibold text-white">Orchestration Synthesis</div>
        <div className="mt-2 text-sm text-slate-300">
          {synthesis?.synthesis_summary || data?.orchestration_summary || "No synthesis available."}
        </div>
      </div>





      <div className="mt-4 rounded-xl border border-amber-800 bg-slate-950 p-4">
        <div className="text-sm font-semibold text-white">
          Selection Explanation
        </div>

        <div className="mt-3 text-sm text-slate-300">
          {selectionExplanation}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-emerald-800 bg-slate-950 p-4">
        <div className="text-sm font-semibold text-white">
          Planner Feedback
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">

          <PlannerStat
            title="Execution Success"
            value={plannerFeedback?.success ? "true" : "false"}
          />

          <PlannerStat
            title="Quality Score"
            value={plannerFeedback?.quality_score ?? 0}
          />

          <PlannerStat
            title="Feedback Reason"
            value={plannerFeedback?.feedback_reason || "unknown"}
          />

        </div>
      </div>

      <div className="mt-4 rounded-xl border border-cyan-800 bg-slate-950 p-4">
        <div className="text-sm font-semibold text-white">
          Sprint Recommendation
        </div>

        <div className="mt-2 text-sm text-slate-300">
          {sprintRecommendation?.recommendation || "No sprint recommendation available."}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <PlannerStat
            title="Priority"
            value={sprintRecommendation?.priority || "unknown"}
          />

          <PlannerStat
            title="Suggested Mode"
            value={sprintRecommendation?.suggested_execution_mode || "unknown"}
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
        <div className="text-sm font-semibold text-white">
          Learning Signals
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <PlannerStat
            title="Total Runs"
            value={learning?.total_runs ?? 0}
          />

          <PlannerStat
            title="Escalation Rate"
            value={learning?.escalation_rate ?? 0}
          />

          <PlannerStat
            title="Success Rate"
            value={learning?.success_rate ?? 0}
          />

          <PlannerStat
            title="Average Quality"
            value={learning?.average_quality_score ?? 0}
          />

          <PlannerStat
            title="Tracked Nodes"
            value={Object.keys(nodeFrequency).length}
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="text-sm font-semibold text-cyan-300">
              Node Frequency
            </div>

            <div className="mt-3 space-y-2">
              {Object.keys(nodeFrequency).map((node) => (
                <div
                  key={node}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-white">{node}</span>

                  <span className="text-slate-400">
                    {nodeFrequency[node]}
                  </span>
                </div>
              ))}
            </div>
          </div>


          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="text-sm font-semibold text-cyan-300">
              Node Reliability
            </div>

            <div className="mt-3 space-y-2">
              {Object.keys(nodeReliability).map((node) => (
                <div
                  key={node}
                  className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white">{node}</span>
                    <span className="text-slate-400">
                      runs: {nodeReliability[node]?.runs ?? 0}
                    </span>
                  </div>

                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <div className="text-slate-400">
                      success: {nodeReliability[node]?.success_rate ?? 0}
                    </div>

                    <div className="text-slate-400">
                      quality: {nodeReliability[node]?.average_quality ?? 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="text-sm font-semibold text-cyan-300">
              Execution Mode Frequency
            </div>

            <div className="mt-3 space-y-2">
              {Object.keys(modeFrequency).map((mode) => (
                <div
                  key={mode}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-white">{mode}</span>

                  <span className="text-slate-400">
                    {modeFrequency[mode]}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {candidates.map((candidate: any) => (
          <div key={candidate.node} className="rounded-xl border border-slate-700 bg-slate-950 p-4">
            <div className="font-mono text-sm text-cyan-300">{candidate.node}</div>
            <div className="mt-1 text-sm text-white">Score: {candidate.score}</div>
            <div className="mt-1 text-xs text-slate-400">{candidate.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}









