$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== EXECUTION LINEAGE INTEGRITY GUARD =="

$integrity = "app/api/hx2/_lib/execution-lineage-integrity.ts"
$composition = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($path in @($integrity, $composition)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$integrityText = Get-Content $integrity -Raw
$compositionText = Get-Content $composition -Raw

$requiredIntegrity = @(
  "validateExecutionPackageLineage",
  "lineage_valid",
  "duplicate_lineage_stages",
  "missing_root",
  "ordering_valid",
  "adaptive-restraint",
  "registry-validation"
)

$requiredComposition = @(
  "validateExecutionPackageLineage",
  "execution_package_lineage_integrity"
)

$missing = @()

foreach ($needle in $requiredIntegrity) {
  if ($integrityText -notlike "*$needle*") {
    $missing += "Missing in lineage integrity helper: $needle"
  }
}

foreach ($needle in $requiredComposition) {
  if ($compositionText -notlike "*$needle*") {
    $missing += "Missing in composition: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Execution lineage integrity guard failed"
}

Write-Host "EXECUTION LINEAGE INTEGRITY GUARD PASSED"
