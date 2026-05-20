$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CAPABILITY PLANNER PREVIEW UI GUARD =="

$panel = "app/owner-console/_components/capability-planner-panel.tsx"
$chatMasterPanels = "app/owner-console/_components/chat-master-panels.tsx"

if (!(Test-Path $panel)) {
  throw "Missing capability planner preview panel"
}

if (!(Test-Path $chatMasterPanels)) {
  throw "Missing chat master panels component"
}

$panelText = Get-Content $panel -Raw
$chatText = Get-Content $chatMasterPanels -Raw

$requiredPanel = @(
  "CapabilityPlannerPreviewPanel",
  "Capability Planner Preview",
  "Live orchestration intelligence preview",
  "Selected Node",
  "Execution Mode",
  "Escalated",
  "Pipeline Steps",
  "Orchestration Synthesis",
  "candidate_nodes",
  "Adaptive Score Audit",
  "Total Boost",
  "Confidence Penalty",
  "Governance Penalty",
  "Negative Learning Penalty",
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
  "Node Reliability / Stability Weighting",
  "stability:",
  "Negative Learning",
  "Node Failures",
  "Sprint Type Failures",
  "Execution Mode Failures",
  "Sprint Type Frequency",
  "Execution Risk Frequency",
  "Execution Mode Frequency",
  "learning_signals",
  "BuildOps Sprint Plan",
  "Sprint Type",
  "Risk Level",
  "Guard Strategy",
  "Sprint Recommendation",
  "Priority",
  "Suggested Mode",
  "sprint_recommendation",
  "Selection Explanation",
  "Planner Feedback",
  "Execution Success",
  "Quality Score",
  "Feedback Reason",
  "planner_feedback"
)

$requiredMount = @(
  "CapabilityPlannerPreviewPanel",
  "./capability-planner-panel"
)

$missing = @()

foreach ($needle in $requiredPanel) {
  if ($panelText -notlike "*$needle*") {
    $missing += "Missing in preview panel: $needle"
  }
}

foreach ($needle in $requiredMount) {
  if ($chatText -notlike "*$needle*") {
    $missing += "Missing in chat master panels mount: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }
  throw "Capability planner preview UI guard failed"
}

Write-Host "CAPABILITY PLANNER PREVIEW UI GUARD PASSED"
















