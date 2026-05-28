$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD HEALTH BUILD PROCESS SOURCE GUARD =="

$HealthPath = "app/api/hx2/_lib/phase3b-build-health-snapshot.ts"

if (!(Test-Path $HealthPath)) {
  throw "Missing build health helper: $HealthPath"
}

$Health = Get-Content $HealthPath -Raw

$RequiredTerms = @(
  "getPhase3BBuildProcessVersion",
  "const buildProcess = getPhase3BBuildProcessVersion();",
  "build_process:",
  "process_mode: buildProcess.process_mode",
  "process_version: buildProcess.process_version",
  "release_notes: buildProcess.release_notes",
  "capabilities: buildProcess.capabilities"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Health.Contains($Term)) {
    throw "Build health source missing required build_process term: $Term"
  }
}

Write-Host "PHASE 3B BUILD HEALTH BUILD PROCESS SOURCE GUARD PASSED"
