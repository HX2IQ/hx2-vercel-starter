$ErrorActionPreference = "Stop"

Write-Host "`n== ORCHESTRATION COMPILER DEPENDENCY GUARD =="

$CompilerPath = "app/api/hx2/_lib/orchestration-compiler.ts"

if (!(Test-Path $CompilerPath)) {
  throw "Missing compiler helper: $CompilerPath"
}

$Compiler = Get-Content $CompilerPath -Raw

$RequiredTerms = @(
  "depends_on",
  "dependencyIssues",
  "stage_dependency_validation_failed",
  "dependency_validation",
  "missing_dependency"
)

foreach ($Term in $RequiredTerms) {
  if ($Compiler -notmatch [regex]::Escape($Term)) {
    throw "Compiler missing dependency-preview term: $Term"
  }
}

if ($Compiler -match 'from "\./sprint-next-composition"') {
  throw "Compiler must not import sprint-next-composition"
}

Write-Host "ORCHESTRATION COMPILER DEPENDENCY GUARD PASSED"
