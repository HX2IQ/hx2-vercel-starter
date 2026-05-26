$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== REGISTRY-DRIVEN ORCHESTRATION VALIDATION GUARD =="

$file = "app/api/hx2/_lib/registry-driven-orchestration-validation.ts"
$composition = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($path in @($file, $composition)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$text = Get-Content $file -Raw
$compositionText = Get-Content $composition -Raw

$required = @(
  "validateSprintNextStageRegistry",
  "requiredStageTypes",
  "registry_valid",
  "missing_stage_types",
  "duplicate_helpers",
  "stage_count"
)

$requiredComposition = @(
  "validateSprintNextStageRegistry",
  "orchestration_stage_registry_validation"
)

$missing = @()

foreach ($needle in $required) {
  if ($text -notlike "*$needle*") {
    $missing += "Missing in validation helper: $needle"
  }
}

foreach ($needle in $requiredComposition) {
  if ($compositionText -notlike "*$needle*") {
    $missing += "Missing in composition: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Registry-driven orchestration validation guard failed"
}

Write-Host "REGISTRY-DRIVEN ORCHESTRATION VALIDATION GUARD PASSED"
