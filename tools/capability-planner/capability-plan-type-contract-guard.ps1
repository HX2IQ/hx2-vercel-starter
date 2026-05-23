$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CAPABILITY PLAN TYPE CONTRACT GUARD =="

$planner = "app/api/hx2/_lib/capability-planner.ts"
$route = "app/api/hx2/sprint-next/route.ts"
$composition = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($path in @($planner, $route, $composition)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$plannerText = Get-Content $planner -Raw
$routeText = Get-Content $route -Raw
$compositionText = Get-Content $composition -Raw

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

$requiredRoute = @(
  "buildSprintNextPayload",
  "NextResponse.json",
  "request"
)

$requiredCompositionHelpers = @(
  "buildCapabilityPlan",
  "buildSprintNextAction",
  "buildPlannerLearningSignals",
  "buildSprintHistorySummary",
  "buildSprintNextPayload"
)

$forbiddenRoutePatterns = @(
  "plan?.learning_signals",
  "plan.learning_signals"
)

$missing = @()

foreach ($field in $requiredPlanFields) {
  if ($plannerText -notlike "*$field*") {
    $missing += "CapabilityPlan missing field: $field"
  }
}

foreach ($needle in $requiredRoute) {
  if ($routeText -notlike "*$needle*") {
    $missing += "Sprint-next route missing thin-route contract: $needle"
  }
}

foreach ($helper in $requiredCompositionHelpers) {
  if ($compositionText -notlike "*$helper*") {
    $missing += "Sprint-next composition missing helper: $helper"
  }
}

foreach ($pattern in $forbiddenRoutePatterns) {
  if ($routeText -like "*$pattern*" -or $compositionText -like "*$pattern*") {
    $missing += "Sprint-next incorrectly reads helper-only field from plan: $pattern"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Capability plan type contract guard failed"
}

Write-Host "CAPABILITY PLAN TYPE CONTRACT GUARD PASSED"
