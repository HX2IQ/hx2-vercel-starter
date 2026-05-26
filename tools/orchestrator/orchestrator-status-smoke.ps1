$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== ORCHESTRATOR STATUS LOCAL CONTRACT SMOKE ==" -ForegroundColor Cyan

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

foreach ($item in $required) {
  if ($text -notmatch [regex]::Escape($item)) {
    throw "Missing orchestrator output field: $item"
  }
}

Write-Host "ORCHESTRATOR STATUS SMOKE PASSED" -ForegroundColor Green
