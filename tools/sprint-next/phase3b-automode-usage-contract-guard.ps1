$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE USAGE CONTRACT GUARD =="

$Files = @(
  "app/api/hx2/_lib/phase3b-build-process-version.ts",
  "tools/sprint-next/sprint-next.ps1",
  "tools/sprint-next/phase3b-automode-usage-visibility-guard.ps1",
  "tools/sprint-next/phase3b-build-process-version-production-probe.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing AutoMode usage contract file: $File"
  }
}

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  "automode_usage_visibility",
  "AUTO MODE RESULT",
  "Expected Vercel usage",
  "Expected VPS usage",
  "Added AutoMode usage visibility"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "AutoMode usage contract missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE USAGE CONTRACT GUARD PASSED"
