$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE EXECUTION SUMMARY GUARD =="

$AliasPath = "tools/sprint-next/sprint-next.ps1"

if (!(Test-Path $AliasPath)) {
  throw "Missing sprint-next alias"
}

$Alias = Get-Content $AliasPath -Raw

$RequiredTerms = @(
  "AUTO MODE EXECUTION SUMMARY",
  "Risk level:",
  "Execution mode selected:",
  "Deploy skipped:",
  "Sprint duration seconds:"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "AutoMode execution summary missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE EXECUTION SUMMARY GUARD PASSED"
