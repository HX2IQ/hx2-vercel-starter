$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CAPABILITY PLANNER PREVIEW UI GUARD =="

$paths = @(
  "app/owner-console/_components/capability-planner-panel.tsx",
  "app/owner-console/_components/adaptive-score-audit.tsx"
)

$combined = ""

foreach ($path in $paths) {
  if (Test-Path $path) {
    $combined += "`n--- $path ---`n"
    $combined += Get-Content $path -Raw
  } else {
    throw "Missing preview UI file: $path"
  }
}

$required = @(
  "CapabilityPlannerPreviewPanel",
  "Capability Planner Preview",
  "Live orchestration intelligence preview",
  "Selected Node",
  "Execution Mode",
  "Escalated",
  "Pipeline Steps",
  "Orchestration Synthesis",
  "candidate_nodes",
  "execution_pipeline",
  "orchestration_synthesis",
  "getCapabilityPlannerMemory",
  "Memory Records",
  "Escalation Count",
  "Pipeline Runs",
  "capability-planner-memory",
  "Learning Signals",
  "Total Runs",
  "Escalation Rate",
  "Success Rate",
  "Average Quality",
  "Tracked Nodes",
  "Node Frequency",
  "Node Reliability",
  "Execution Mode Frequency",
  "Sprint Recommendation",
  "Priority",
  "Suggested Mode",
  "sprint_recommendation",
  "Planner Feedback",
  "Execution Success",
  "Quality Score",
  "Feedback Reason",
  "planner_feedback",
  "Selection Explanation",
  "BuildOps Sprint Plan",
  "Sprint Type",
  "Risk Level",
  "Guard Strategy",
  "Adaptive Score Audit",
  "Total Boost",
  "Confidence Penalty",
  "Governance Penalty",
  "Negative Learning Penalty"
)

$missing = @()

foreach ($needle in $required) {
  if ($combined -notlike "*$needle*") {
    $missing += "Missing in preview UI surface: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Capability planner preview UI guard failed"
}

Write-Host "CAPABILITY PLANNER PREVIEW UI GUARD PASSED"
