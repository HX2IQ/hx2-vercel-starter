$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== RUNTIME INTELLIGENCE CAPABILITY CONTRACT GUARD =="

$Files = @(
  "app/api/hx2/_lib/runtime-intelligence-router.ts",
  "app/api/hx2/runtime-intelligence-route/route.ts",
  "app/api/hx2/_lib/phase3b-build-process-version.ts",
  "tools/sprint-next/runtime-intelligence-route-production-probe.ps1",
  "tools/sprint-next/runtime-intelligence-route-status.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing runtime intelligence contract file: $File"
  }
}

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  "runtime_intelligence_router",
  "runtime_intelligence_query_inputs",
  "runtime_intelligence_router_contract_tests",
  "runtime_intelligence_route_matrix_probe",
  "runtime_intelligence_status_viewer",
  "reasoning_depth",
  "execution_mode",
  "cache_allowed",
  "orchestration_level",
  "token_budget"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "Runtime intelligence capability contract missing term: $Term"
  }
}

Write-Host "RUNTIME INTELLIGENCE CAPABILITY CONTRACT GUARD PASSED"
