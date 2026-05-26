$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 ORCHESTRATOR READINESS REPORT ==" -ForegroundColor Cyan
Write-Host ""

$route = ".\app\api\hx2\orchestrator-status\route.ts"

if (!(Test-Path $route)) {
  throw "Missing orchestrator status route"
}

$text = Get-Content $route -Raw

function Has($value) {
  return $text -match [regex]::Escape($value)
}

$fields = @(
  "severity",
  "readiness_percent",
  "critical_readiness_percent",
  "optional_readiness_percent",
  "missing_critical",
  "missing_optional"
)

$missing = @()

foreach ($field in $fields) {
  if (!(Has $field)) {
    $missing += $field
  }
}

Write-Host "Contract Fields Present:" -ForegroundColor Yellow

foreach ($field in $fields) {
  $ok = Has $field

  if ($ok) {
    Write-Host "  PASS  $field" -ForegroundColor Green
  }
  else {
    Write-Host "  FAIL  $field" -ForegroundColor Red
  }
}

Write-Host ""

if ($missing.Count -eq 0) {
  Write-Host "ORCHESTRATOR READINESS: HEALTHY" -ForegroundColor Green
}
elseif ($missing.Count -le 2) {
  Write-Host "ORCHESTRATOR READINESS: DEGRADED" -ForegroundColor Yellow
}
else {
  Write-Host "ORCHESTRATOR READINESS: CRITICAL" -ForegroundColor Red
}

Write-Host ""
Write-Host "Missing Fields: $($missing.Count)" -ForegroundColor Cyan

if ($missing.Count -gt 0) {
  $missing | ForEach-Object {
    Write-Host " - $_" -ForegroundColor Yellow
  }
}

Write-Host ""
