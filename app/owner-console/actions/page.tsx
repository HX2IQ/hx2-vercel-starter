"use client";

function getLastSuccessfulRemoteAction(history: any[]) {
  if (!Array.isArray(history)) return null;

  const remoteNames = new Set([
    "regression_smoke",
    "brain_connectivity",
    "h2_refresh",
  ]);

  return history.find((item) => {
    const ok = item?.ok === true;
    const action = String(item?.action || "");
    return ok && remoteNames.has(action);
  }) || null;
}

function getLastActionByName(history: any[], actionName: string) {
  if (!Array.isArray(history)) return null;
  return history.find((item) => String(item?.action || "") === actionName) || null;
}

function getLastRemoteTaskEntry(history: any[]) {
  if (!Array.isArray(history)) return null;
  return history.find((item) => item?.task_type && item?.task_state) || null;
}

function formatTaskState(item: any) {
  if (!item?.task_state) return "Unknown";
  return String(item.task_state);
}

function formatTaskType(item: any) {
  if (!item?.task_type) return "Unknown";
  return String(item.task_type);
}

function formatActionResult(item: any) {
  if (!item) return "Unknown";
  return item?.ok ? "Success" : "Failed";
}


import { useEffect, useState } from "react";

const ACTIONS = [
  { key: "owner_summary", label: "Run Owner Summary", localOnly: true },
  { key: "drift_dashboard", label: "Build Drift Dashboard", localOnly: true },
  { key: "release_note", label: "Generate Release Note", localOnly: true },
  { key: "regression_smoke", label: "Run Regression Smoke", localOnly: false, remoteReady: true },
  { key: "brain_connectivity", label: "Check Brain Connectivity", localOnly: false, remoteReady: true },
  { key: "h2_refresh", label: "Refresh H2 Intelligence", localOnly: false, remoteReady: true },
  { key: "node_scaffold", label: "Create Node Scaffold", localOnly: false, remoteReady: false },
];

function formatAge(ts?: string | null) {
  if (!ts) return "";
  const then = new Date(ts).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin === 1) return "1 min ago";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr === 1) return "1 hr ago";
  if (diffHr < 24) return `${diffHr} hr ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "1 day ago";
  return `${diffDay} days ago`;
}

function getFreshnessTone(ts?: string | null) {
  if (!ts) return "none";
  const then = new Date(ts).getTime();
  if (Number.isNaN(then)) return "none";

  const diffMin = Math.floor((Date.now() - then) / 60000);
  if (diffMin < 15) return "fresh";
  if (diffMin <= 60) return "aging";
  return "stale";
}

function StatusCard({
  title,
  value,
  tone = "neutral",
}: {
  title: string;
  value: string;
  tone?: "neutral" | "success" | "error";
}) {
  const style =
    tone === "success"
      ? "border-emerald-800 bg-emerald-950 text-emerald-200"
      : tone === "error"
      ? "border-red-800 bg-red-950 text-red-200"
      : "border-slate-700 bg-slate-900 text-white";

  return (
    <div className={`rounded-2xl border p-4 ${style}`}>
      <div className="text-sm opacity-80">{title}</div>
      <div className="mt-2 break-all text-sm">{value}</div>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const normalized = String(value || "").toLowerCase();

  const style =
    normalized === "reachable" || normalized === "pass"
      ? "border-emerald-800 bg-emerald-950 text-emerald-200"
      : normalized.includes("warn_timeout")
      ? "border-red-800 bg-red-950 text-red-200"
      : normalized.includes("warn_guarded")
      ? "border-amber-700 bg-amber-950 text-amber-200"
      : "border-slate-700 bg-slate-900 text-slate-200";

  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${style}`}>
      {value || "unknown"}
    </span>
  );
}

function getRecommendedNextMove(remoteTaskStatus: any) {
  const summary = remoteTaskStatus?.result?.summary;
  const x2 = summary?.x2_status?.classification || "";
  const h2 = summary?.h2_status?.classification || "";
  const h2Cross = summary?.h2_cross_status?.classification || "";
  const brain = summary?.brain_status || "";

  if (brain !== "reachable") {
    return "Investigate brain connectivity before trusting downstream diagnostics.";
  }

  if (x2 === "warn_timeout") {
    return "Investigate X2 timeout path first, then rerun Regression Smoke.";
  }

  if (h2 === "warn_guarded_no_recent_intelligence" || h2Cross === "warn_guarded_no_recent_intelligence") {
    return "Ingest or refresh H2 intelligence, then rerun Regression Smoke.";
  }

  return "No immediate operator action required. Diagnostics completed without hard failures.";
}

const FOLLOWUP_CAPABILITY_MAP: Record<string, { type: string }> = {
  "Investigate X2": { type: "local_only" },
  "Refresh H2 Intelligence": { type: "remote_ready" },
  "Check Brain Connectivity": { type: "remote_ready" },
  "No Follow-Up Needed": { type: "none" }
};

function getFollowUpCapability(action: string) {
  return FOLLOWUP_CAPABILITY_MAP[action] || { type: "unknown" };
}
function getFollowUpCapabilityLabel(action: string) {
  const capability = getFollowUpCapability(action).type;
  if (capability === "remote_ready") return "Remote Ready";
  if (capability === "local_only") return "Local Only";
  if (capability === "none") return "Guidance Only";
  return "Unknown";
}

function getPriorityActionTone(action: string): "neutral" | "success" | "error" {
  const capability = getFollowUpCapability(action).type;
  if (capability === "remote_ready") return "success";
  if (capability === "local_only") return "error";
  return "neutral";
}

function getPrimaryActionModel(remoteTaskStatus: any) {
  const action = getSuggestedFollowUpAction(remoteTaskStatus);
  const capability = getFollowUpCapabilityLabel(action);
  const reason = getRecommendedNextMove(remoteTaskStatus);
  const tone = getPriorityActionTone(action);
  const canRunNow =
    action === "Check Brain Connectivity" ||
    action === "Refresh H2 Intelligence";

  return {
    action,
    capability,
    reason,
    tone,
    canRunNow,
  };
}

function getSuggestedFollowUpAction(remoteTaskStatus: any) {
  const summary = remoteTaskStatus?.result?.summary;
  const x2 = summary?.x2_status?.classification || "";
  const h2 = summary?.h2_status?.classification || "";
  const h2Cross = summary?.h2_cross_status?.classification || "";
  const brain = summary?.brain_status || "";

  if (brain !== "reachable") {
    return "Check Brain Connectivity";
  }

  if (x2 === "warn_timeout") {
    return "Investigate X2";
  }

  if (h2 === "warn_guarded_no_recent_intelligence" || h2Cross === "warn_guarded_no_recent_intelligence") {
    return "Refresh H2 Intelligence";
  }

  return "No Follow-Up Needed";
}

function RecommendationCard({
  state,
  label,
  rationale,
  running,
  requiresConfirm,
  confirmed,
  onConfirmChange,
  onRun,
}: {
  state: string;
  label: string;
  rationale: string;
  running: boolean;
  requiresConfirm: boolean;
  confirmed: string;
  onConfirmChange: (v: string) => void;
  onRun: () => void;
}) {
  const style =
    state === "green"
      ? "border-emerald-800 bg-emerald-950"
      : state === "degraded"
      ? "border-amber-700 bg-amber-950"
      : "border-red-800 bg-red-950";

  const textStyle =
    state === "green"
      ? "text-emerald-200"
      : state === "degraded"
      ? "text-amber-200"
      : "text-red-200";

  const needsDeploy = label === "Run Deploy";
  const canRun = !requiresConfirm || (needsDeploy ? confirmed === "RUN DEPLOY" : confirmed === "RUN POSTFLIGHT");

  return (
    <div className={`rounded-2xl border p-4 ${style}`}>
      <div className={`text-sm ${textStyle}`}>{label}</div>
      <div className="mt-2 text-sm text-slate-200">{rationale}</div>

      {requiresConfirm ? (
        <div className="mt-4">
          <div className="mb-2 text-xs text-slate-300">
            {needsDeploy ? "Type RUN DEPLOY to enable this action." : "Type RUN POSTFLIGHT to enable this action."}
          </div>
          <input
            value={confirmed}
            onChange={(e) => onConfirmChange(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
            placeholder={needsDeploy ? "RUN DEPLOY" : "RUN POSTFLIGHT"}
          />
        </div>
      ) : null}

      <button
        onClick={onRun}
        disabled={running || !canRun}
        className="mt-4 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {running ? `Running: ${label}` : `Run: ${label}`}
      </button>
    </div>
  );
}

export default function OwnerActionsPage() {
  const [running, setRunning] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [lastAction, setLastAction] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const [mappedRecs, setMappedRecs] = useState<any[]>([]);
  const [suppressed, setSuppressed] = useState<string[]>([]);
  const [o2State, setO2State] = useState<string>("unknown");
  const [postflightConfirm, setPostflightConfirm] = useState<string>("");
  const [deployConfirm, setDeployConfirm] = useState<string>("");
  const [chainResetConfirm, setChainResetConfirm] = useState<string>("");
  const [chain, setChain] = useState<any[]>([]);
  const [chainState, setChainState] = useState<string>("unknown");
  const [chainResetAt, setChainResetAt] = useState<string | null>(null);
  const [cycleStartedAt, setCycleStartedAt] = useState<string | null>(null);
  const [autopilot, setAutopilot] = useState<any>(null);
  const [autopilotPolicy, setAutopilotPolicy] = useState<any>(null);
  const [remoteTaskStatus, setRemoteTaskStatus] = useState<any>(null);
  const [autopilotDryRun, setAutopilotDryRun] = useState<any>(null);
  const [nodeScaffoldId, setNodeScaffoldId] = useState<string>("test-node");
  const [nodeScaffoldLabel, setNodeScaffoldLabel] = useState<string>("Test Node");
  const [nodeScaffoldType, setNodeScaffoldType] = useState<string>("analysis");

  async function loadHistory() {
    try {
      const res = await fetch("/api/owner/action-history", { cache: "no-store" });
      const json = await res.json();
      setHistory(json?.history || []);
    } catch {
      setHistory([]);
    }
  }

  async function loadAutopilot() {
    try {
      const res = await fetch("/api/owner/o2-autopilot-decision", { cache: "no-store" });
      const json = await res.json();
      setAutopilot(json || null);
    } catch {
      setAutopilot(null);
    }
  }

  async function loadAutopilotPolicy() {
    try {
      const res = await fetch("/api/owner/o2-autopilot-policy", { cache: "no-store" });
      const json = await res.json();
      setAutopilotPolicy(json || null);
    } catch {
      setAutopilotPolicy(null);
    }
  }

  async function loadAutopilotDryRun() {
    try {
      const res = await fetch("/api/owner/o2-autopilot-dry-run", { cache: "no-store" });
      const json = await res.json();
      setAutopilotDryRun(json || null);
    } catch {
      setAutopilotDryRun(null);
    }
  }

  async function setAutopilotEnabled(enabled: boolean) {
    setRunning(enabled ? "autopilot_enable" : "autopilot_disable");
    setResult(null);
    setLastAction(enabled ? "autopilot_enable" : "autopilot_disable");

    try {
      const res = await fetch("/api/owner/o2-autopilot-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      const json = await res.json();
      setResult(json);

// add to history
if (json?.ok && json?.action) {
  setHistory((prev: any[]) => [
    {
      action: json.action,
      ok: json.ok,
      timestamp: new Date().toISOString(),
    },
    ...prev.slice(0, 9),
  ]);
}

      await loadAutopilotPolicy();
      await loadAutopilot();
      await loadAutopilotDryRun();
      await loadChain();
      await loadMappedRecommendations();
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || String(err) });
    } finally {
      setRunning("");
    }
  }


  async function pollRemoteTask(taskId: string) {
  setRemoteTaskStatus({ taskId, state: "QUEUED" });

  let final: any = null;

  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`/api/ap2/task/status?taskId=${encodeURIComponent(taskId)}`, {
        cache: "no-store",
      });

      const json = await res.json();

      setRemoteTaskStatus({ ...json });

      if (json?.state === "COMPLETED" || json?.state === "FAILED" || json?.state === "ERROR") {
        final = json;
        break;
      }
    } catch (err) {
      console.error("pollRemoteTask error:", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  if (final) {
    setRemoteTaskStatus({ ...final });
  }

    try {
      await fetch("/api/owner/remote-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: final?.taskId,
          taskType: final?.taskType,
          state: final?.state,
          result: final?.result || null,
        }),
      });
    } catch (err) {
      console.error("remote-result persist error:", err);
    }

  return final;
}

  async function loadChain() {
    try {
      const res = await fetch("/api/owner/o2-chain", { cache: "no-store" });
      const json = await res.json();
      setChain(json?.chain || []);
      setChainState(json?.state || "unknown");
      setChainResetAt(json?.chain_reset_at || null);
      setCycleStartedAt(json?.cycle_started_at || null);
    } catch {
      setChain([]);
      setChainState("unknown");
      setChainResetAt(null);
      setCycleStartedAt(null);
    }
  }

  async function loadMappedRecommendations() {
    try {
      const res = await fetch("/api/owner/o2-action-map", { cache: "no-store" });
      const json = await res.json();
      setMappedRecs(json?.recommendations || []);
      setSuppressed(json?.suppressed || []);
      setO2State(json?.state || "unknown");
    } catch {
      setMappedRecs([]);
      setSuppressed([]);
      setO2State("unknown");
    }
  }

  useEffect(() => {
    loadHistory();
    loadMappedRecommendations();
    loadChain();
    loadAutopilot();
    loadAutopilotPolicy();
    loadAutopilotDryRun();
  }, []);

  async function resetChainMemory() {
    setRunning("chain_reset");
    setResult(null);
    setLastAction("chain_reset");

    try {
      const res = await fetch("/api/owner/o2-chain-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const json = await res.json();
      setResult(json);

// add to history
if (json?.ok && json?.action) {
  setHistory((prev: any[]) => [
    {
      action: json.action,
      ok: json.ok,
      timestamp: new Date().toISOString(),
    },
    ...prev.slice(0, 9),
  ]);
}

      const remoteTaskId = json?.enqueue?.task?.taskId;
      if (json?.mode === "remote_ap2" && remoteTaskId) {
        await pollRemoteTask(remoteTaskId);
      }

      await loadHistory();
      await loadMappedRecommendations();
      await loadChain();
      await loadAutopilot();
      await loadAutopilotPolicy();
      await loadAutopilotDryRun();
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || String(err) });
    } finally {
      setRunning("");
    }
  }

  async function runFollowUpAction(action: string) {
        if (action !== "Check Brain Connectivity" && action !== "Refresh H2 Intelligence") return;

        const isBrain = action === "Check Brain Connectivity";
    const followupKey = isBrain ? "followup_brain_connectivity" : "followup_h2_refresh";

    setRunning(followupKey);
    setResult(null);
    setRemoteTaskStatus(null);
    setLastAction(followupKey);

    try {
      const res = await fetch("/api/owner/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
          action: action === "Check Brain Connectivity" ? "brain_connectivity" : "h2_refresh"
        }),
      });

      const json = await res.json();
      setResult(json);

// add to history
if (json?.ok && json?.action) {
  setHistory((prev: any[]) => [
    {
      action: json.action,
      ok: json.ok,
      timestamp: new Date().toISOString(),
    },
    ...prev.slice(0, 9),
  ]);
}

      const remoteTaskId = json?.enqueue?.task?.taskId || json?.taskId;
      if (json?.mode === "remote_ap2" && remoteTaskId) {
        await pollRemoteTask(remoteTaskId);
      }
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || String(err) });
    } finally {
      setRunning("");
    }
  }

  async function runAction(action: string) {
    setRunning(action);
    setResult(null);
    setRemoteTaskStatus(null);
    setLastAction(action);

    try {
            if (action === "brain_connectivity") {
        await runFollowUpAction("Check Brain Connectivity");
        await loadMappedRecommendations();
        await loadChain();
        await loadAutopilot();
        return;
      }

      if (action === "h2_refresh") {
        await runFollowUpAction("Refresh H2 Intelligence");
        await loadMappedRecommendations();
        await loadChain();
        await loadAutopilot();
        return;
      }

      const res = await fetch("/api/owner/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          payload: action === "node_scaffold"
            ? {
                node_id: nodeScaffoldId,
                node_label: nodeScaffoldLabel,
                node_type: nodeScaffoldType,
              }
            : undefined,
        }),
      });

      const json = await res.json();
      setResult(json);

// add to history
if (json?.ok && json?.action) {
  setHistory((prev: any[]) => [
    {
      action: json.action,
      ok: json.ok,
      timestamp: new Date().toISOString(),
    },
    ...prev.slice(0, 9),
  ]);
}

      const remoteTaskId = json?.enqueue?.task?.taskId;
      if (json?.mode === "remote_ap2" && remoteTaskId) {
        await pollRemoteTask(remoteTaskId);
      }

      await loadHistory();
      await loadMappedRecommendations();
      await loadChain();
      await loadAutopilot();
      await loadAutopilotPolicy();
      await loadAutopilotDryRun();
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || String(err) });
      await loadHistory();
      await loadMappedRecommendations();
      await loadChain();
      await loadAutopilot();
      await loadAutopilotPolicy();
      await loadAutopilotDryRun();
    } finally {
      setRunning("");
    }
  }

  const priorityAction = getSuggestedFollowUpAction(remoteTaskStatus);
  const primaryActionModel = getPrimaryActionModel(remoteTaskStatus);
  const priorityActionCapability = getFollowUpCapabilityLabel(priorityAction);
  const priorityActionReason = getRecommendedNextMove(remoteTaskStatus);

  const ok = !!result?.ok;
  const stdout = result?.stdout || "";
  const stderr = result?.stderr || result?.error || "";
  const isPostflightResult = result?.action === "postflight";
  const isDeployResult = result?.action === "deploy";

  const nextStep =
    chain.find((x: any) => x.status === "ready" || x.status === "required") ||
    chain.find((x: any) => x.status === "confirm") ||
    chain.find((x: any) => x.status === "review") ||
    null;

  const chainCounts = {
    ready: chain.filter((x: any) => x.status === "ready").length,
    confirm: chain.filter((x: any) => x.status === "confirm").length,
    required: chain.filter((x: any) => x.status === "required").length,
    review: chain.filter((x: any) => x.status === "review").length,
    done_recently: chain.filter((x: any) => x.status === "done_recently").length,
  };

  const chainHealth =
    chainCounts.required > 0
      ? {
          label: "Blocked",
          className: "border-red-800 bg-red-950 text-red-200",
          detail: "Chain contains required steps that should be addressed before normal progression.",
        }
      : chainCounts.confirm > 0 || chainCounts.review > 0
      ? {
          label: "Caution",
          className: "border-amber-700 bg-amber-950 text-amber-200",
          detail: "Chain can proceed, but one or more steps require confirmation or review.",
        }
      : {
          label: "Clear",
          className: "border-emerald-800 bg-emerald-950 text-emerald-200",
          detail: "Chain has actionable ready steps and no current blockers.",
        };

  const lastSuccessfulRemoteAction = getLastSuccessfulRemoteAction(history);

    const lastRegressionSmoke = getLastActionByName(history, "regression_smoke");
  const lastRemoteTaskEntry = getLastRemoteTaskEntry(history);
  const lastBrainConnectivity = getLastActionByName(history, "brain_connectivity");
  const completedSteps = chainCounts.done_recently;
  const totalSteps = chain.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const cycleStatus =
    chainCounts.required > 0
      ? {
          label: "Blocked",
          className: "border-red-800 bg-red-950 text-red-200",
          detail: "One or more required steps are preventing completion.",
        }
      : chainCounts.ready === 0 && (chainCounts.confirm > 0 || chainCounts.review > 0)
      ? {
          label: "Pending Confirmation",
          className: "border-amber-700 bg-amber-950 text-amber-200",
          detail: "All actionable steps are complete; awaiting confirmation or review.",
        }
      : chainCounts.ready === 0
      ? {
          label: "Complete",
          className: "border-emerald-800 bg-emerald-950 text-emerald-200",
          detail: "All steps completed for the current cycle.",
        }
      : {
          label: "In Progress",
          className: "border-slate-700 bg-slate-900 text-slate-200",
          detail: "Cycle is still progressing through actionable steps.",
        };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold">Owner Actions</h1>
        <p className="mt-2 text-sm text-slate-400">
          Owner-approved safe actions only.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {ACTIONS.map((a) => (
            <button
              key={a.key}
              onClick={() => {
                if (!a.localOnly) runAction(a.key);
              }}
              disabled={!!running || !!a.localOnly}
              className={`rounded-xl border px-4 py-3 text-sm transition disabled:opacity-50 ${
                a.localOnly
                  ? "border-slate-800 bg-slate-950 text-slate-400 cursor-not-allowed"
                  : "border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
              }`}
              title={a.localOnly ? "Requires local PowerShell + repo" : a.label}
            >
              <div>
                {a.localOnly
                  ? `${a.label} — Local Only`
                  : a.remoteReady
                  ? (running === a.key ? `Running: ${a.label}` : `${a.label} — Remote Ready`)
                  : (running === a.key ? `Running: ${a.label}` : a.label)}
              </div>
              {a.localOnly ? (
                <div className="mt-1 text-xs text-slate-500">Requires local PowerShell + repo</div>
              ) : a.remoteReady ? (
                <div className="mt-1 text-xs text-emerald-400">Runs through AP2 remote diagnostic rail</div>
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-indigo-700 bg-indigo-950 p-5">
          <h2 className="text-lg font-semibold text-indigo-200">Priority Action</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <StatusCard
              title="Action"
              value={primaryActionModel.action || "No immediate action"}
              tone={primaryActionModel.tone}
            />
            <StatusCard
              title="Execution Type"
              value={primaryActionModel.capability || "Unknown"}
              tone={primaryActionModel.tone}
            />
            <StatusCard
              title="Why"
              value={primaryActionModel.reason || "No reason available"}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (primaryActionModel.canRunNow) {
                  runFollowUpAction(primaryActionModel.action);
                }
              }}
              disabled={
                !!running ||
                !primaryActionModel.canRunNow
              }
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition disabled:opacity-50 ${
                getFollowUpCapability(primaryActionModel.action).type === "remote_ready"
                  ? "border-indigo-700 bg-indigo-900 text-indigo-200 hover:bg-indigo-800"
                  : "border-slate-700 bg-slate-900 text-slate-400 cursor-not-allowed"
              }`}
            >
              {running === "followup_brain_connectivity" || running === "followup_h2_refresh"
                ? `Running: ${primaryActionModel.action}`
                : `Run Now: ${primaryActionModel.action}`}
            </button>

            <div className="self-center text-xs text-slate-300">
              {primaryActionModel.reason || ""}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">Autopilot</h2>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-sm text-slate-400">Policy Status</div>
            <div className="mt-2 text-sm text-white">
              Enabled: {autopilotPolicy ? (autopilotPolicy.enabled ? "Yes" : "No") : "Loading..."}
            </div>
            <div className="text-xs text-slate-500">
              Mode: {autopilotPolicy?.mode || "unknown"}
            </div>

            <button
              onClick={() => setAutopilotEnabled(!autopilotPolicy?.enabled)}
              disabled={!!running || !autopilotPolicy}
              className="mt-4 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {running === "autopilot_enable"
                ? "Enabling Autopilot..."
                : running === "autopilot_disable"
                ? "Disabling Autopilot..."
                : autopilotPolicy?.enabled
                ? "Disable Autopilot"
                : "Enable Autopilot"}
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <StatusCard title="Enabled" value={autopilot ? (autopilot.enabled ? "Yes" : "No") : "Unknown"} tone={autopilot?.enabled ? "success" : "neutral"} />
            <StatusCard title="Eligible" value={autopilot ? (autopilot.eligible ? "Yes" : "No") : "Unknown"} tone={autopilot?.eligible ? "success" : "error"} />
            <StatusCard title="Mode" value={autopilot?.mode || "unknown"} />
            <StatusCard title="State" value={autopilot?.state || "unknown"} />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-sm text-slate-400">Next Eligible Safe Step</div>
            <div className="mt-2 text-sm text-white">
              {autopilot?.next_step ? `${autopilot.next_step.step}. ${autopilot.next_step.label}` : "None"}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {autopilot?.reason || "No autopilot reason available."}
            </div>

            {autopilot?.eligible && autopilot?.next_step ? (
              <button
                onClick={() => runAction(autopilot.next_step.action)}
                disabled={!!running}
                className="mt-4 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {running === autopilot.next_step.action
                  ? `Running: ${autopilot.next_step.label}`
                  : `Run Eligible Step Now`}
              </button>
            ) : null}

            {autopilotDryRun?.dry_run?.would_run && (autopilotDryRun?.dry_run?.action || autopilot?.next_step?.action) ? (
              <button
                onClick={() => runAction(autopilotDryRun?.dry_run?.action || autopilot?.next_step?.action)}
                disabled={!!running}
                className="mt-4 rounded-xl border border-emerald-700 bg-emerald-900/40 px-4 py-3 text-sm text-white transition hover:bg-emerald-800/50 disabled:opacity-50"
              >
                {running === (autopilotDryRun?.dry_run?.action || autopilot?.next_step?.action)
                  ? `Running: ${autopilotDryRun?.dry_run?.label || autopilot?.next_step?.label || "Dry-Run Safe Action"}`
                  : "Execute Dry-Run Plan Now"}
              </button>
            ) : null}
          </div>
        </div>


        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5">
                  <div className="mt-8 rounded-2xl border border-indigo-700 bg-indigo-950 p-5">
          <h2 className="text-lg font-semibold text-indigo-200">Operator Prompt</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <StatusCard
              title="Recommended Action"
              value={primaryActionModel.action || "None"}
            />

            <StatusCard
              title="Execution Type"
              value={primaryActionModel.capability || "N/A"}
            />

            <StatusCard
              title="Why"
              value={primaryActionModel.reason || "No recommendation available"}
            />
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                const action = getSuggestedFollowUpAction(remoteTaskStatus);
                if (action === "Check Brain Connectivity" || action === "Refresh H2 Intelligence") {
                  runFollowUpAction(action);
                }
              }}
              disabled={
                !!running ||
                !["Check Brain Connectivity","Refresh H2 Intelligence"].includes(getSuggestedFollowUpAction(remoteTaskStatus))
              }
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition disabled:opacity-50 ${
                getFollowUpCapability(getSuggestedFollowUpAction(remoteTaskStatus)).type === "remote_ready"
                  ? "border-indigo-700 bg-indigo-900 text-indigo-200 hover:bg-indigo-800"
                  : "border-slate-700 bg-slate-900 text-slate-400 cursor-not-allowed"
              }`}
            >
              Run Recommended Action
            </button>
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-emerald-700 bg-emerald-950 p-5">
          <h2 className="text-lg font-semibold text-emerald-200">Node Scaffold Draft</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <div className="mb-2 text-sm text-emerald-100">Node ID</div>
              <input
                value={nodeScaffoldId}
                onChange={(e) => setNodeScaffoldId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                placeholder="test-node"
              />
            </div>

            <div>
              <div className="mb-2 text-sm text-emerald-100">Node Label</div>
              <input
                value={nodeScaffoldLabel}
                onChange={(e) => setNodeScaffoldLabel(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                placeholder="Test Node"
              />
            </div>

            <div>
              <div className="mb-2 text-sm text-emerald-100">Node Type</div>
              <input
                value={nodeScaffoldType}
                onChange={(e) => setNodeScaffoldType(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                placeholder="analysis"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => runAction("node_scaffold")}
              disabled={!!running || !nodeScaffoldId || !nodeScaffoldLabel || !nodeScaffoldType}
              className="rounded-xl border border-emerald-700 bg-emerald-900 px-4 py-3 text-sm font-medium text-emerald-200 transition hover:bg-emerald-800 disabled:opacity-50"
            >
              {running === "node_scaffold" ? "Creating Draft Scaffold..." : "Create Draft Scaffold"}
            </button>
          </div>
        </div>
<h2 className="text-lg font-semibold">O2 Recommended Safe Actions</h2>
          <div className="mt-2 text-sm text-slate-400">Current O2 state: {o2State}</div>
          <div className="mt-2 text-sm text-slate-500">
            Suppressed actions: {suppressed.length ? suppressed.join(", ") : "none"}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {mappedRecs.length === 0 ? (
              <div className="text-sm text-slate-500">No mapped recommendations available.</div>
            ) : (
              mappedRecs.map((rec) => (
                <div key={rec.id} id={`action-${rec.action}`}>
                  <RecommendationCard
                    state={o2State}
                    label={rec.label}
                    rationale={rec.rationale}
                    running={running === rec.action}
                    requiresConfirm={rec.action === "postflight" || rec.action === "deploy"}
                    confirmed={rec.action === "deploy" ? deployConfirm : postflightConfirm}
                    onConfirmChange={(v) =>
                      rec.action === "deploy" ? setDeployConfirm(v) : setPostflightConfirm(v)
                    }
                    onRun={() => runAction(rec.action)}
                  />
                </div>
              ))
            )}
          </div>
        </div>


        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">O2 Proposed Execution Chain</h2>
          <div className="mt-2 text-sm text-slate-400">
            Current chain state: {chainState}
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${chainHealth.className}`}>
            <div className="text-sm font-semibold">Chain Health: {chainHealth.label}</div>
            <div className="mt-1 text-xs opacity-90">{chainHealth.detail}</div>
            <div className="mt-1 text-xs opacity-80">
              {chainResetAt ? `Last chain reset: ${chainResetAt} (${formatAge(chainResetAt)})` : "Last chain reset: not recorded"}
            </div>
            <div className="mt-2 text-xs opacity-80">
              {cycleStartedAt ? `Current cycle started: ${cycleStartedAt} (${formatAge(cycleStartedAt)})` : "Current cycle started: not recorded"}
            </div>
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${cycleStatus.className}`}>
            <div className="text-sm font-semibold">Cycle Status: {cycleStatus.label}</div>
            <div className="mt-1 text-xs opacity-90">{cycleStatus.detail}</div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-300">Chain Progress</div>
              <div className="text-white">{progressPercent}%</div>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {completedSteps} of {totalSteps} steps completed recently
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <div className="rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 text-emerald-200">
              Fresh &lt; 15 min
            </div>
            <div className="rounded-full border border-amber-700 bg-amber-950 px-3 py-1 text-amber-200">
              Aging 15–60 min
            </div>
            <div className="rounded-full border border-red-800 bg-red-950 px-3 py-1 text-red-200">
              Stale &gt; 60 min
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-300">
              No recent timestamp
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <StatusCard title="Ready" value={`${chainCounts.ready}`} tone="success" />
            <StatusCard title="Confirm" value={`${chainCounts.confirm}`} />
            <StatusCard title="Required" value={`${chainCounts.required}`} tone="error" />
            <StatusCard title="Review" value={`${chainCounts.review}`} />
            <StatusCard title="Done Recently" value={`${chainCounts.done_recently}`} tone="success" />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-sm text-slate-400">Next Recommended Step</div>
            <div className="mt-2 text-sm text-white">
              {nextStep ? `${nextStep.step}. ${nextStep.label}` : "No recommended next step"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {nextStep ? `Status: ${nextStep.status}` : "Chain is idle or unavailable"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {nextStep ? "Recently completed steps are skipped automatically." : ""}
            </div>
            <div className="mt-2 text-xs text-slate-400">
              {nextStep ? `Why: ${nextStep.reason || "No reason provided"}` : ""}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {nextStep ? `Action: ${nextStep.action}` : ""}
            </div>
            {nextStep ? (
              <div className="mt-3 flex gap-3">
                <a
                  href={`#action-${nextStep.action}`}
                  className="inline-block rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800"
                >
                  Jump to action
                </a>

                {nextStep.status === "ready" || nextStep.status === "required" ? (
                  <button
                    onClick={() => runAction(nextStep.action)}
                    disabled={!!running}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {running === nextStep.action ? `Running: ${nextStep.label}` : `Run This Step`}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-4 space-y-2">
            {chain.length === 0 ? (
              <div className="text-sm text-slate-500">No chain available.</div>
            ) : (
              chain.map((step: any) => {
                const tone = getFreshnessTone(step.recent_timestamp);
                const rowStyle =
                  tone === "fresh"
                    ? "border-emerald-800 bg-emerald-950"
                    : tone === "aging"
                    ? "border-amber-700 bg-amber-950"
                    : tone === "stale"
                    ? "border-red-800 bg-red-950"
                    : "border-slate-800 bg-slate-950";

                return (
                  <div
                    key={step.step}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${rowStyle}`}
                  >
                    <div>
                      <div>
                        {step.step}. {step.label}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {step.recent_timestamp ? `Recent: ${step.recent_timestamp}` : ""}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {step.recent_timestamp ? `Age: ${formatAge(step.recent_timestamp)}` : ""}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      {step.status === "ready" && "✅ Ready"}
                      {step.status === "confirm" && "🔒 Confirm"}
                      {step.status === "required" && "⚠ Required"}
                      {step.status === "review" && "👁 Review"}
                      {step.status === "done_recently" && "🟦 Done Recently"}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatusCard title="Last Action" value={lastAction || "None yet"} />
          <StatusCard
            title="Result"
            value={result ? (ok ? "Success" : "Failed") : "No action run yet"}
            tone={result ? (ok ? "success" : "error") : "neutral"}
          />
          <StatusCard title="Action Key" value={result?.action || "-"} />
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Stdout</h2>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
              {stdout || "No stdout."}
            </pre>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Stderr / Error</h2>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
              {stderr || "No stderr."}
            </pre>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <div className="text-sm text-slate-300">Reset Chain Memory</div>
            <div className="mt-2 text-xs text-slate-500">Type RESET CHAIN to enable.</div>
            <input
              value={chainResetConfirm}
              onChange={(e) => setChainResetConfirm(e.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
              placeholder="RESET CHAIN"
            />
            <button
              onClick={() => resetChainMemory()}
              disabled={!!running || chainResetConfirm !== "RESET CHAIN"}
              className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {running === "chain_reset" ? "Resetting Chain..." : "Reset Chain Memory"}
            </button>
          </div>

          <a
            href="/owner-console"
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-center text-sm text-white transition hover:bg-slate-800"
          >
            Back to Owner Console
          </a>
          <a
            href="/owner-console?refresh=1"
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-center text-sm text-white transition hover:bg-slate-800"
          >
            Open Owner Console (Refresh)
          </a>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white transition hover:bg-slate-800"
          >
            Reload This Page
          </button>
        </div>

        {isPostflightResult ? (
          <div className={`mt-8 rounded-2xl border p-5 ${ok ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-red-800 bg-red-950 text-red-200"}`}>
            <h2 className="text-lg font-semibold">Postflight Next Steps</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {ok ? (
                <>
                  <li>• Refresh Owner Console to confirm updated state.</li>
                  <li>• Review the latest baseline and release note outputs.</li>
                  <li>• Check drift dashboard and O2 status before further actions.</li>
                </>
              ) : (
                <>
                  <li>• Refresh Owner Console to inspect current system state.</li>
                  <li>• Review autopsy and recent action history.</li>
                  <li>• Do not continue with further release actions until failure is understood.</li>
                </>
              )}
            </ul>
          </div>
        ) : isDeployResult ? (
          <div className={`mt-8 rounded-2xl border p-5 ${ok ? "border-emerald-800 bg-emerald-950 text-emerald-200" : "border-red-800 bg-red-950 text-red-200"}`}>
            <h2 className="text-lg font-semibold">Deploy Next Steps</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {ok ? (
                <>
                  <li>• Deployment completed successfully.</li>
                  <li>• Run regression smoke to confirm live behavior.</li>
                  <li>• Review owner console and release outputs.</li>
                </>
              ) : (
                <>
                  <li>• Deployment failed — do not proceed.</li>
                  <li>• Review stderr and action history.</li>
                  <li>• Investigate before retrying deploy.</li>
                </>
              )}
            </ul>
          </div>
        ) : null}

        {remoteTaskStatus ? (
          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Remote Task Result</h2>
            <div className="mt-2 text-sm text-slate-400">
              Task: {remoteTaskStatus?.taskId || "unknown"} · State: {remoteTaskStatus?.state || "unknown"}
            </div>

            {remoteTaskStatus?.result?.mode === "diagnostic" ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-sm text-slate-400">Brain</div>
                  <div className="mt-2">
                    <StatusBadge value={remoteTaskStatus?.result?.summary?.brain_status || "unknown"} />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="text-sm text-slate-400">X2</div>
                    <div className="mt-2">
                      <StatusBadge value={remoteTaskStatus?.result?.summary?.x2_status?.classification || "unknown"} />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {remoteTaskStatus?.result?.summary?.x2_status?.reason || ""}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="text-sm text-slate-400">H2</div>
                    <div className="mt-2">
                      <StatusBadge value={remoteTaskStatus?.result?.summary?.h2_status?.classification || "unknown"} />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {remoteTaskStatus?.result?.summary?.h2_status?.reason || ""}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="text-sm text-slate-400">H2 Cross</div>
                    <div className="mt-2">
                      <StatusBadge value={remoteTaskStatus?.result?.summary?.h2_cross_status?.classification || "unknown"} />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {remoteTaskStatus?.result?.summary?.h2_cross_status?.reason || ""}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-sm text-slate-400">Recommended Next Operator Move</div>
                  <div className="mt-2 text-sm text-white">
                    {getRecommendedNextMove(remoteTaskStatus)}
                  </div>
                </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="text-sm text-slate-400">Diagnostic Prompt</div>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <StatusCard
                        title="Recommended Action"
                        value={getSuggestedFollowUpAction(remoteTaskStatus)}
                        tone={getFollowUpCapability(getSuggestedFollowUpAction(remoteTaskStatus)).type === "remote_ready" ? "success" : "neutral"}
                      />

                      <StatusCard
                        title="Execution Type"
                        value={getFollowUpCapabilityLabel(getSuggestedFollowUpAction(remoteTaskStatus))}
                        tone={getFollowUpCapability(getSuggestedFollowUpAction(remoteTaskStatus)).type === "remote_ready" ? "success" : getFollowUpCapability(getSuggestedFollowUpAction(remoteTaskStatus)).type === "local_only" ? "error" : "neutral"}
                      />

                      <StatusCard
                        title="Why"
                        value={getRecommendedNextMove(remoteTaskStatus)}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const action = getSuggestedFollowUpAction(remoteTaskStatus);
                          if (action === "Check Brain Connectivity" || action === "Refresh H2 Intelligence") {
                            runFollowUpAction(action);
                          }
                        }}
                        disabled={
                          !!running ||
                          !["Check Brain Connectivity","Refresh H2 Intelligence"].includes(getSuggestedFollowUpAction(remoteTaskStatus))
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition disabled:opacity-50 ${
                          getFollowUpCapability(getSuggestedFollowUpAction(remoteTaskStatus)).type === "remote_ready"
                            ? "border-emerald-700 bg-emerald-950 text-emerald-200 hover:bg-emerald-900"
                            : "border-slate-700 bg-slate-900 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {(running === "followup_brain_connectivity" || running === "followup_h2_refresh")
                          ? `Running: ${getSuggestedFollowUpAction(remoteTaskStatus)}`
                          : `Run Now: ${getSuggestedFollowUpAction(remoteTaskStatus)}`}
                      </button>

                      <div className="self-center text-xs text-slate-500">
                        {getRecommendedNextMove(remoteTaskStatus)}
                      </div>
                    </div>
                  </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5">
                  <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">System Health Summary</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <StatusCard
              title="Brain"
              value={
                lastBrainConnectivity
                  ? formatActionResult(lastBrainConnectivity)
                  : "Unknown"
              }
              tone={lastBrainConnectivity?.ok ? "success" : "neutral"}
            />

            <StatusCard
              title="Last Remote Action"
              value={
                lastSuccessfulRemoteAction
                  ? `${String(lastSuccessfulRemoteAction?.action || "unknown")} · ${formatAge(lastSuccessfulRemoteAction?.timestamp) || "unknown"}`
                  : "None"
              }
              tone={lastSuccessfulRemoteAction?.ok ? "success" : "neutral"}
            />

            <StatusCard
              title="Last Regression Smoke"
              value={
                lastRegressionSmoke
                  ? `${formatActionResult(lastRegressionSmoke)} · ${formatAge(lastRegressionSmoke?.timestamp) || "unknown"}`
                  : "None"
              }
              tone={lastRegressionSmoke?.ok ? "success" : "neutral"}
            />

            <StatusCard
              title="Queue / Task Rail"
              value={
                lastRemoteTaskEntry
                  ? `${formatTaskType(lastRemoteTaskEntry)} · ${formatTaskState(lastRemoteTaskEntry)} · ${formatAge(lastRemoteTaskEntry?.timestamp) || "unknown"}`
                  : "None"
              }
              tone={
                lastRemoteTaskEntry?.task_state === "COMPLETED"
                  ? "success"
                  : lastRemoteTaskEntry?.task_state === "FAILED" || lastRemoteTaskEntry?.task_state === "ERROR"
                  ? "error"
                  : "neutral"
              }
            />
          </div>
        </div>
          <h2 className="text-lg font-semibold">Last Successful Remote Action</h2>

          {lastSuccessfulRemoteAction ? (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <StatusCard
                title="Action"
                value={String(lastSuccessfulRemoteAction?.action || "unknown")}
                tone="success"
              />
              <StatusCard
                title="When"
                value={formatAge(lastSuccessfulRemoteAction?.timestamp) || String(lastSuccessfulRemoteAction?.timestamp || "unknown")}
              />
              <StatusCard
                title="Status"
                value={lastSuccessfulRemoteAction?.ok ? "Success" : "Unknown"}
                tone={lastSuccessfulRemoteAction?.ok ? "success" : "neutral"}
              />
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-500">
              No successful remote actions recorded yet.
            </div>
          )}
        </div>
<h2 className="text-lg font-semibold">Recent Action History</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="px-3 py-2 text-left">Timestamp</th>
                  <th className="px-3 py-2 text-left">Action</th>
                  <th className="px-3 py-2 text-left">Result</th>
                  <th className="px-3 py-2 text-left">Stdout Tail</th>
                  <th className="px-3 py-2 text-left">Stderr Tail</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-slate-500" colSpan={5}>
                      No action history available.
                    </td>
                  </tr>
                ) : (
                  history.map((row: any, i: number) => (
                    <tr key={`${row.timestamp}-${row.action}-${i}`} className="border-b border-slate-800 align-top">
                      <td className="px-3 py-2">{row.timestamp || "-"}</td>
                      <td className="px-3 py-2">{row.action || "-"}</td>
                      <td className={`px-3 py-2 ${row.ok ? "text-emerald-300" : "text-red-300"}`}>
                        {row.ok ? "Success" : "Failed"}
                      </td>
                      <td className="px-3 py-2">
                        <pre className="whitespace-pre-wrap text-xs text-slate-300">
                          {row.stdout_tail || ""}
                        </pre>
                      </td>
                      <td className="px-3 py-2">
                        <pre className="whitespace-pre-wrap text-xs text-slate-300">
                          {row.stderr_tail || ""}
                        </pre>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>


        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">Raw Result</h2>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
            {result ? JSON.stringify(result, null, 2) : "No action run yet."}
          </pre>
        </div>
      </div>
    </main>
  );
}




























































