$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD PROCESS VERSION CONSISTENCY GUARD =="

$RequiredFiles = @(
  "app/api/hx2/_lib/phase3b-build-process-version.ts",
  "app/api/hx2/_lib/phase3b-route-matrix.ts",
  "app/api/hx2/_lib/phase3b-release-manifest.ts",
  "app/api/hx2/_lib/phase3b-sprint-snapshot.ts"
)

foreach ($File in $RequiredFiles) {
  if (!(Test-Path $File)) {
    throw "Missing required file: $File"
  }
}

$Combined = ($RequiredFiles | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  "/api/hx2/phase3b-build-process-version",
  "phase3b_build_process_version",
  "fast_safe_sprint",
  "process_version"
)

foreach ($Term in $RequiredTerms) {
  if ($Combined -notmatch [regex]::Escape($Term)) {
    throw "Build process version consistency missing required term: $Term"
  }
}

Write-Host "PHASE 3B BUILD PROCESS VERSION CONSISTENCY GUARD PASSED"
