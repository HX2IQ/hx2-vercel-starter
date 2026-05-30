$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE HISTORICAL TELEMETRY GUARD =="

$AliasPath = "tools/sprint-next/sprint-next.ps1"

if (!(Test-Path $AliasPath)) {
  throw "Missing sprint-next alias"
}

$Alias = Get-Content $AliasPath -Raw

$RequiredTerms = @(
  "AUTO MODE HISTORICAL TELEMETRY",
  "Historical telemetry mode",
  "Recent sprint audits analyzed",
  "AUTO MODE SPEED PROFILE",
  "Speed profile:",
  "Expected deploy latency:"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "AutoMode historical telemetry missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE HISTORICAL TELEMETRY GUARD PASSED"
