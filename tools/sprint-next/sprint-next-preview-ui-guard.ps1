$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT NEXT PREVIEW UI GUARD =="

$panel = "app/owner-console/_components/sprint-next-panel.tsx"

if (!(Test-Path $panel)) {
  throw "Missing sprint next panel"
}

$text = Get-Content $panel -Raw

$required = @(
  "SprintNextPreviewPanel",
  "Sprint Next Planner",
  "Planner-driven DEV2 build sequencing preview",
  "Sprint Recommendation",
  "Risk Gate",
  "Gate",
  "Reason",
  "Risk Gate Actions",
  "recommended_sequence",
  "History Summary",
  "Top Sprint Type",
  "Top Mode",
  "Top Success Node",
  "Top Failure Node",
  "history_summary"
)

$missing = @()

foreach ($needle in $required) {
  if ($text -notlike "*$needle*") {
    $missing += "Missing in sprint next panel: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Sprint next preview UI guard failed"
}

Write-Host "SPRINT NEXT PREVIEW UI GUARD PASSED"


