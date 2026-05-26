$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== EXECUTION PACKAGE LINEAGE GUARD =="

$lineage = "app/api/hx2/_lib/sprint-execution-package-lineage.ts"
$composition = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($path in @($lineage, $composition)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$lineageText = Get-Content $lineage -Raw
$compositionText = Get-Content $composition -Raw

$requiredLineage = @(
  "SprintExecutionPackageLineage",
  "buildSprintExecutionPackageLineage",
  "evolveSprintExecutionPackage",
  "root_package",
  "active_package",
  "lineage"
)

$requiredComposition = @(
  "buildSprintExecutionPackageLineage",
  "evolveSprintExecutionPackage",
  "execution_package_lineage",
  "adaptive-restraint",
  "registry-validation"
)

$missing = @()

foreach ($needle in $requiredLineage) {
  if ($lineageText -notlike "*$needle*") {
    $missing += "Missing in lineage helper: $needle"
  }
}

foreach ($needle in $requiredComposition) {
  if ($compositionText -notlike "*$needle*") {
    $missing += "Missing in composition: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Execution package lineage guard failed"
}

Write-Host "EXECUTION PACKAGE LINEAGE GUARD PASSED"
