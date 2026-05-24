$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== ORCHESTRATION STAGE REGISTRY INTEGRITY GUARD =="

$registry = "app/api/hx2/_lib/sprint-next-stage-registry.ts"
$integrity = "app/api/hx2/_lib/sprint-next-stage-registry-integrity.ts"
$composition = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($path in @($registry, $integrity, $composition)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$integrityText = Get-Content $integrity -Raw
$compositionText = Get-Content $composition -Raw

$requiredIntegrity = @(
  "buildStageRegistryIntegrity",
  "stage_count",
  "by_type",
  "duplicate_ids",
  "duplicate_helpers",
  "registry_ok"
)

$requiredComposition = @(
  "buildStageRegistryIntegrity",
  "orchestration_stage_registry_integrity"
)

$missing = @()

foreach ($needle in $requiredIntegrity) {
  if ($integrityText -notlike "*$needle*") {
    $missing += "Missing in integrity helper: $needle"
  }
}

foreach ($needle in $requiredComposition) {
  if ($compositionText -notlike "*$needle*") {
    $missing += "Missing in composition: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Orchestration stage registry integrity guard failed"
}

Write-Host "ORCHESTRATION STAGE REGISTRY INTEGRITY GUARD PASSED"
