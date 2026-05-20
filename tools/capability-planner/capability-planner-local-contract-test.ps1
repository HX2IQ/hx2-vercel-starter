$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CAPABILITY PLANNER LOCAL CONTRACT TEST =="

$planner = "app/api/hx2/_lib/capability-planner.ts"

if (!(Test-Path $planner)) {
  throw "Missing capability planner lib"
}

$text = Get-Content $planner -Raw

$requiredOutputFields = @(
  "intent",
  "candidate_nodes",
  "selected_node",
  "selection_explanation",
  "execution_strategy",
  "confidence",
  "execution_results",
  "orchestration_synthesis",
  "execution_pipeline",
  "request_complexity",
  "execution_mode",
  "escalation",
  "planner_feedback",
  "orchestration_summary"
)

$requiredCapabilities = @(
  "buildops_execution",
  "market_analysis",
  "health_analysis",
  "applyAdaptiveNodeScoring",
  "evaluateExecutionEscalation",
  "evaluatePlannerFeedback",
  "buildSelectionExplanation"
)

$missing = @()

foreach ($needle in $requiredOutputFields) {
  if ($text -notlike "*$needle*") {
    $missing += "Missing planner output field: $needle"
  }
}

foreach ($needle in $requiredCapabilities) {
  if ($text -notlike "*$needle*") {
    $missing += "Missing planner capability: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($item in $missing) {
    Write-Host "- $item"
  }

  throw "Capability planner local contract test failed"
}

Write-Host "CAPABILITY PLANNER LOCAL CONTRACT TEST PASSED"
