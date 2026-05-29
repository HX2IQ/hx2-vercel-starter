param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B DASHBOARD HEALTH PRODUCTION PROBE =="

$Response = Invoke-RestMethod "$BaseUrl/api/hx2/phase3b-build-process-version"

if ($Response.capabilities.dashboard_health -ne $true) {
  throw "Production build-process version missing dashboard_health capability"
}

Write-Host "PHASE 3B DASHBOARD HEALTH PRODUCTION PROBE PASSED"
