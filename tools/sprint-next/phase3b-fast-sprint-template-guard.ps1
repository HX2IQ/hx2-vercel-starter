$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B FAST SPRINT TEMPLATE GUARD =="

$TemplatePath = "tools/sprint-next/phase3b-fast-sprint-template.ps1"

if (!(Test-Path $TemplatePath)) {
  throw "Missing fast sprint template: $TemplatePath"
}

$Template = Get-Content $TemplatePath -Raw

$RequiredTerms = @(
  "phase3b-fast-safe-sprint.ps1",
  "FeatureName",
  "Message",
  "LocalOnly"
)

foreach ($Term in $RequiredTerms) {
  if ($Template -notmatch [regex]::Escape($Term)) {
    throw "Fast sprint template missing required term: $Term"
  }
}

Write-Host "PHASE 3B FAST SPRINT TEMPLATE GUARD PASSED"
