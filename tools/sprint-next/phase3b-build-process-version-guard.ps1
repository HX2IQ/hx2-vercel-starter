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
  "local_only_mode",
  "dry_run_mode",
  "skip_diff_summary",
  "fast_no_review_mode",
  "audit_log",
  "master_production_verify"
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

