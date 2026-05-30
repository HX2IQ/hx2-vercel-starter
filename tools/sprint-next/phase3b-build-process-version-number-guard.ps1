$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD PROCESS VERSION NUMBER GUARD =="

$Files = @(
  "app/api/hx2/_lib/phase3b-build-process-version.ts",
  "tools/sprint-next/phase3b-build-process-version-production-probe.ps1",
  "tools/sprint-next/phase3b-build-process-version-consistency-guard.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing version guard file: $File"
  }
}

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

if ($Combined -notmatch '3b\.12') {
  throw "Phase 3B build process version 3b.12 not found"
}

if ($Combined -match '3b\.6|3b\.5|3b\.4|3b\.3|3b\.2|3b\.1') {
  throw "Old Phase 3B build process version still present"
}

Write-Host "PHASE 3B BUILD PROCESS VERSION NUMBER GUARD PASSED"











