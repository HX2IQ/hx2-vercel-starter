$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT HISTORY SUMMARY GUARD =="

$summary = "app/api/hx2/_lib/sprint-history-summary.ts"
$route = "app/api/hx2/sprint-next/route.ts"

foreach ($path in @($summary, $route)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$summaryText = Get-Content $summary -Raw
$routeText = Get-Content $route -Raw

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
  "buildPlannerLearningSignals",
  "buildSprintHistorySummary",
  "history_summary"
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

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Sprint history summary guard failed"
}

Write-Host "SPRINT HISTORY SUMMARY GUARD PASSED"
