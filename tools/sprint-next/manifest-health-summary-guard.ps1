$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== MANIFEST HEALTH SUMMARY GUARD =="

$helper = "app/api/hx2/_lib/manifest-health-summary.ts"
$composition = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($path in @($helper, $composition)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$helperText = Get-Content $helper -Raw
$compositionText = Get-Content $composition -Raw

$requiredHelper = @(
  "buildManifestHealthSummary",
  "manifest_ok",
  "stage_count",
  "duplicate_ids",
  "duplicate_helpers",
  "missing_stage_types"
)

$requiredComposition = @(
  "buildManifestHealthSummary",
  "manifest_health_summary"
)

$missing = @()

foreach ($needle in $requiredHelper) {
  if ($helperText -notlike "*$needle*") {
    $missing += "Missing in manifest helper: $needle"
  }
}

foreach ($needle in $requiredComposition) {
  if ($compositionText -notlike "*$needle*") {
    $missing += "Missing in composition: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Manifest health summary guard failed"
}

Write-Host "MANIFEST HEALTH SUMMARY GUARD PASSED"
