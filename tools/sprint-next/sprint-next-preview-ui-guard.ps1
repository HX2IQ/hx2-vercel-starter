$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT NEXT PREVIEW UI GUARD =="

$paths = @(
  "app/owner-console/_components/sprint-next-panel.tsx",
  "app/owner-console/_components/risk-gate-actions.tsx"
)

$combined = ""

foreach ($path in $paths) {
  if (!(Test-Path $path)) {
    throw "Missing sprint next UI file: $path"
  }

  $combined += "`n--- $path ---`n"
  $combined += Get-Content $path -Raw
}

$required = @(
  "SprintNextPreviewPanel",
  "Sprint Next Planner",
  "Planner-driven DEV2 build sequencing preview",
  "Sprint Recommendation",
  "History Summary",
  "Top Sprint Type",
  "Top Mode",
  "Top Success Node",
  "Top Failure Node",
  "history_summary",
  "Risk Gate",
  "Gate",
  "Reason",
  "RiskGateActions",
  "Risk Gate Actions",
  "sequence"
)

$missing = @()

foreach ($needle in $required) {
  if ($combined -notlike "*$needle*") {
    $missing += "Missing in sprint next UI surface: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Sprint next preview UI guard failed"
}

Write-Host "SPRINT NEXT PREVIEW UI GUARD PASSED"
