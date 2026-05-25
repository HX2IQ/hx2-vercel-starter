$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== ORCHESTRATION STAGE MANIFEST API GUARD =="

$route = "app/api/hx2/orchestration-stage-manifest/route.ts"

if (!(Test-Path $route)) {
  throw "Missing orchestration stage manifest route"
}

$text = Get-Content $route -Raw

$required = @(
  "GET",
  "NextResponse.json",
  "sprintNextStageRegistry",
  "buildStageRegistryIntegrity",
  "validateSprintNextStageRegistry",
  "stage_registry",
  "stage_registry_integrity",
  "stage_registry_validation",
  "phase_3_deterministic_orchestration_core"
)

$missing = @()

foreach ($needle in $required) {
  if ($text -notlike "*$needle*") {
    $missing += "Missing: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Orchestration stage manifest API guard failed"
}

Write-Host "ORCHESTRATION STAGE MANIFEST API GUARD PASSED"
