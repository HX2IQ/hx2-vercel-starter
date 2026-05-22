$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== ORCHESTRATION OUTCOME SUMMARY PREVIEW GUARD =="

$panel = "app/owner-console/_components/orchestration-outcome-summary-panel.tsx"
$mount = "app/owner-console/_components/chat-master-panels.tsx"

foreach ($path in @($panel, $mount)) {
  if (!(Test-Path $path)) {
    throw "Missing required UI file: $path"
  }
}

$combined = (Get-Content $panel -Raw) + "`n" + (Get-Content $mount -Raw)

$required = @(
  "OrchestrationOutcomeSummaryPanel",
  "Orchestration Outcome Summary",
  "Persistent runtime telemetry",
  "Summary API",
  "Avg Learning Weight",
  "Latest Record",
  "orchestration-outcome-summary-panel"
)

$missing = @()

foreach ($needle in $required) {
  if ($combined -notlike "*$needle*") {
    $missing += "Missing: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Orchestration outcome summary preview guard failed"
}

Write-Host "ORCHESTRATION OUTCOME SUMMARY PREVIEW GUARD PASSED"
