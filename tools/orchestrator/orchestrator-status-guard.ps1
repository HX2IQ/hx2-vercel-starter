$ErrorActionPreference = "Stop"

$File = ".\app\api\hx2\orchestrator-status\route.ts"

if (!(Test-Path $File)) {
  throw "Missing orchestrator status route"
}

$text = Get-Content $File -Raw

$required = @(
  "critical_checks",
  "optional_checks",
  "readiness_percent",
  "critical_readiness_percent",
  "optional_readiness_percent",
  "severity",
  "missing_critical",
  "missing_optional"
)

$missing = @()

foreach ($item in $required) {
  if ($text -notmatch [regex]::Escape($item)) {
    $missing += $item
  }
}

if ($missing.Count -gt 0) {
  Write-Host "ORCHESTRATOR STATUS GUARD FAILED" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "- Missing: $_" -ForegroundColor Yellow }
  throw "Orchestrator status contract incomplete"
}

Write-Host "ORCHESTRATOR STATUS GUARD PASSED" -ForegroundColor Green
