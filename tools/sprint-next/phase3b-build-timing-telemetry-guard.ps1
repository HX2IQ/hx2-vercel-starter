$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD TIMING TELEMETRY GUARD =="

$Files = @(
  "tools/sprint-next/phase3b-fast-safe-sprint.ps1",
  "tools/sprint-next/phase3b-master-production-verify.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing timing telemetry file: $File"
  }

  $Content = Get-Content $File -Raw

  if (-not $Content.Contains("StartedAtDate")) {
    throw "Timing telemetry missing StartedAtDate in $File"
  }

  if (-not $Content.Contains("duration_seconds")) {
    throw "Timing telemetry missing duration_seconds in $File"
  }
}

Write-Host "PHASE 3B BUILD TIMING TELEMETRY GUARD PASSED"
