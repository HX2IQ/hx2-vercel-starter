$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE DEPLOY MEMORY CONTRACT GUARD =="

$Files = @(
  "app/api/hx2/_lib/phase3b-build-process-version.ts",
  "tools/sprint-next/phase3b-build-process-version-guard.ps1",
  "tools/sprint-next/phase3b-build-process-version-production-probe.ps1",
  "tools/sprint-next/phase3b-automode-deploy-memory-gitignore-guard.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing AutoMode deploy memory contract file: $File"
  }
}

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  "automode_deploy_memory",
  "automode_deploy_memory_gitignore",
  "Protected AutoMode deploy memory audit files from git",
  "tools/sprint-next/_audit/"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "AutoMode deploy memory contract missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE DEPLOY MEMORY CONTRACT GUARD PASSED"
