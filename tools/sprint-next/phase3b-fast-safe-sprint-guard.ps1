$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B FAST SAFE SPRINT GUARD =="

$FastPath = "tools/sprint-next/phase3b-fast-safe-sprint.ps1"

if (!(Test-Path $FastPath)) {
  throw "Missing fast safe sprint runner: $FastPath"
}

$Script = Get-Content $FastPath -Raw

$RequiredTerms = @(
  "PHASE 3B FAST SAFE SPRINT",
  "dev2-feature-compiler.ps1",
  "phase3b-sprint-closure.ps1",
  "SkipDeploy",
  "git status --short",
  "git add -A",
  "git commit -m",
  "FULL DEPLOY CLOSURE",
  "PHASE 3B FAST SAFE SPRINT PASSED"
)

foreach ($Term in $RequiredTerms) {
  if ($Script -notmatch [regex]::Escape($Term)) {
    throw "Fast safe sprint runner missing required term: $Term"
  }
}

Write-Host "PHASE 3B FAST SAFE SPRINT GUARD PASSED"
