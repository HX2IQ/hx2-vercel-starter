$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CAPABILITY PLAN TYPE CONTRACT GUARD =="

$planner = "app/api/hx2/_lib/capability-planner.ts"
$sprintNext = "app/api/hx2/sprint-next/route.ts"

foreach ($path in @($planner, $sprintNext)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$plannerText = Get-Content $planner -Raw
$sprintText = Get-Content $sprintNext -Raw

$requiredPlanFields = @(
  "selected_node",
  "selection_explanation",
  "execution_results",
  "orchestration_synthesis",
  "execution_pipeline",
  "request_complexity",
  "execution_mode",
  "escalation",
  "planner_feedback",
  "buildops_sprint_plan"
)

$missing = @()

foreach ($field in $requiredPlanFields) {
  if ($plannerText -notlike "*$field*") {
    $missing += "CapabilityPlan missing field: $field"
  }
}

$forbiddenSprintNextPatterns = @(
  "plan?.learning_signals",
  "plan.learning_signals"
)

foreach ($pattern in $forbiddenSprintNextPatterns) {
  if ($sprintText -like "*$pattern*") {
    $missing += "Sprint-next route incorrectly reads helper-only field from plan: $pattern"
  }
}

$requiredSprintNextHelpers = @(
  "buildCapabilityPlan",
  "buildSprintNextAction",
  "buildPlannerLearningSignals",
  "buildSprintHistorySummary"
)

foreach ($helper in $requiredSprintNextHelpers) {
  if ($sprintText -notlike "*$helper*") {
    $missing += "Sprint-next route missing helper: $helper"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Capability plan type contract guard failed"
}

Write-Host "CAPABILITY PLAN TYPE CONTRACT GUARD PASSED"
