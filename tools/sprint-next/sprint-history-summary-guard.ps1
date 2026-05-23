$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT HISTORY SUMMARY GUARD =="

$summary = "app/api/hx2/_lib/sprint-history-summary.ts"
$route = "app/api/hx2/sprint-next/route.ts"
$composition = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($path in @($summary, $route, $composition)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$summaryText = Get-Content $summary -Raw
$routeText = Get-Content $route -Raw
$compositionText = Get-Content $composition -Raw

$requiredSummary = @(
  "SprintHistorySummary",
  "buildSprintHistorySummary",
  "top_sprint_type",
  "top_execution_mode",
  "top_success_node",
  "top_failure_node",
  "node_reliability",
  "negative_learning"
)

$requiredRoute = @(
  "buildSprintNextPayload",
  "sprint_next",
  "planner"
)

$requiredComposition = @(
  "buildSprintHistorySummary",
  "history_summary",
  "buildPlannerLearningSignals"
)

$missing = @()

foreach ($needle in $requiredSummary) {
  if ($summaryText -notlike "*$needle*") {
    $missing += "Missing in summary helper: $needle"
  }
}

foreach ($needle in $requiredRoute) {
  if ($routeText -notlike "*$needle*") {
    $missing += "Missing in sprint-next route: $needle"
  }
}

foreach ($needle in $requiredComposition) {
  if ($compositionText -notlike "*$needle*") {
    $missing += "Missing in composition helper: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Sprint history summary guard failed"
}

Write-Host "SPRINT HISTORY SUMMARY GUARD PASSED"
