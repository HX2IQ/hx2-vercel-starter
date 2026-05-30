param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD DASHBOARD =="

$Viewers = @(
  ".\tools\sprint-next\phase3b-version-status.ps1",
  ".\tools\sprint-next\phase3b-latest-audit.ps1",
  ".\tools\sprint-next\phase3b-latest-timing-report.ps1",
  ".\tools\sprint-next\phase3b-latest-impact-report.ps1",
  ".\tools\sprint-next\phase3b-latest-speed-decision.ps1",
  ".\tools\sprint-next\phase3b-latest-automode-decision.ps1",
  ".\tools\sprint-next\phase3b-latest-production-verify-summary.ps1"
)

foreach ($Viewer in $Viewers) {
  if (!(Test-Path $Viewer)) {
    Write-Host ""
    Write-Host "Skipping missing viewer: $Viewer"
    continue
  }

  Write-Host ""
  Write-Host "== RUN VIEWER: $Viewer =="

  if ($Viewer -like "*phase3b-version-status.ps1") {
    powershell -ExecutionPolicy Bypass -File $Viewer -BaseUrl $BaseUrl
  } else {
    powershell -ExecutionPolicy Bypass -File $Viewer
  }
}






