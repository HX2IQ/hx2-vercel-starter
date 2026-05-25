$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3 ORCHESTRATION DIAGNOSTICS GUARD =="

$helper = "app/api/hx2/_lib/phase3-orchestration-diagnostics.ts"
$composition = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($path in @($helper, $composition)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$helperText = Get-Content $helper -Raw
$compositionText = Get-Content $composition -Raw

$requiredHelper = @(
  "buildPhase3OrchestrationDiagnostics",
  "phase_3_deterministic_orchestration_core",
  "manifest_health",
  "registry_integrity",
  "registry_validation",
  "execution_lineage_integrity"
)

$requiredComposition = @(
  "buildPhase3OrchestrationDiagnostics",
  "phase3_orchestration_diagnostics"
)

$missing = @()

foreach ($needle in $requiredHelper) {
  if ($helperText -notlike "*$needle*") {
    $missing += "Missing in diagnostics helper: $needle"
  }
}

foreach ($needle in $requiredComposition) {
  if ($compositionText -notlike "*$needle*") {
    $missing += "Missing in composition: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Phase 3 orchestration diagnostics guard failed"
}

Write-Host "PHASE 3 ORCHESTRATION DIAGNOSTICS GUARD PASSED"
