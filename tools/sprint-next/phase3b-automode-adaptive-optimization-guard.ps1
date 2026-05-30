$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE ADAPTIVE OPTIMIZATION GUARD =="

$AliasPath = "tools/sprint-next/sprint-next.ps1"

if (!(Test-Path $AliasPath)) {
  throw "Missing sprint-next alias"
}

$Alias = Get-Content $AliasPath -Raw

$RequiredTerms = @(
  "AUTO MODE ADAPTIVE OPTIMIZATION",
  "Optimization mode:",
  "Adaptive optimization score:",
  "AUTO MODE PIPELINE PRESSURE",
  "Pipeline pressure:",
  "Changed files analyzed:",
  "Risk classification:"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "AutoMode adaptive optimization missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE ADAPTIVE OPTIMIZATION GUARD PASSED"
