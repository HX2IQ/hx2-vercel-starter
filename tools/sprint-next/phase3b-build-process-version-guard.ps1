$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD PROCESS VERSION GUARD =="

$VersionPath = "app/api/hx2/_lib/phase3b-build-process-version.ts"
$RoutePath = "app/api/hx2/phase3b-build-process-version/route.ts"

foreach ($Path in @($VersionPath, $RoutePath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Version = Get-Content $VersionPath -Raw
$Route = Get-Content $RoutePath -Raw

$RequiredTerms = @(
  "hx2-phase3b-build-process",
  "fast_safe_sprint",
  "process_version",
  "release_notes",
  "local_only_mode",
  "dry_run_mode",
  "skip_diff_summary",
  "fast_no_review_mode",
  "audit_log",
  "master_production_verify",
  "parallel_production_verify",
  "serial_retry_fallback",
  "latest_production_verify_summary",
  "build_dashboard",
  "dashboard_surface_consistency",
  "dashboard_capability_consistency",
  "readonly_dashboard_guard",
  "production_probe_timing_summary",
  "impact_speed_decision_advisory",
  "cached_validation_advisory_only"
)

foreach ($Term in $RequiredTerms) {
  if ($Version -notmatch [regex]::Escape($Term)) {
    throw "Build process version missing required term: $Term"
  }
}

if ($Route -notmatch "/api/hx2/phase3b-build-process-version") {
  throw "Build process version route missing canonical marker"
}

Write-Host "PHASE 3B BUILD PROCESS VERSION GUARD PASSED"







