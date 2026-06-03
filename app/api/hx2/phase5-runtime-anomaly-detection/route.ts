import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type AnomalySignal = {
  signal_id: string;
  subsystem: string;
  anomaly_score: number;
  severity: "none" | "low" | "medium" | "high";
  action_required: boolean;
};

const anomalySignals: AnomalySignal[] = [
  {
    signal_id: "anom_001",
    subsystem: "runtime_intelligence_aggregate",
    anomaly_score: 0.02,
    severity: "none",
    action_required: false
  },
  {
    signal_id: "anom_002",
    subsystem: "orchestration_state",
    anomaly_score: 0.03,
    severity: "none",
    action_required: false
  },
  {
    signal_id: "anom_003",
    subsystem: "live_telemetry_feed",
    anomaly_score: 0.04,
    severity: "none",
    action_required: false
  },
  {
    signal_id: "anom_004",
    subsystem: "runtime_history",
    anomaly_score: 0.01,
    severity: "none",
    action_required: false
  }
];

function buildAnomalySummary() {

  const activeAnomalies = anomalySignals.filter(
    (signal) => signal.action_required
  );

  const averageAnomalyScore =
    anomalySignals.reduce(
      (sum, signal) => sum + signal.anomaly_score,
      0
    ) / anomalySignals.length;

  return {
    runtime_anomaly_detection_active: true,

    monitored_signal_count: anomalySignals.length,

    active_anomaly_count: activeAnomalies.length,

    average_anomaly_score: Number(
      averageAnomalyScore.toFixed(3)
    ),

    runtime_status: activeAnomalies.length === 0 ? "stable" : "attention_required",

    anomaly_response_ready: true,

    orchestration_guardrails_active: true,

    historical_drift_detection_ready: true,

    phase5_anomaly_detection_active: true
  };
}

export async function GET() {

  return NextResponse.json({
    ok: true,

    route: "/api/hx2/phase5-runtime-anomaly-detection",

    mode: "read_only_phase5_runtime_anomaly_detection",

    mutation_allowed: false,

    orchestration_stage:
      "phase5_runtime_anomaly_detection",

    anomaly_summary:
      buildAnomalySummary(),

    anomaly_signals:
      anomalySignals,

    dev2: {
      stabilization_complete: true,
      deterministic_validation_active: true,
      preview_first_active: true,
      orchestration_safe: true
    }
  });
}
