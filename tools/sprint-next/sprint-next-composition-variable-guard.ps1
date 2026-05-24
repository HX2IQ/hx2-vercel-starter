$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT NEXT COMPOSITION VARIABLE REFERENCE GUARD =="

$file = "app/api/hx2/_lib/sprint-next-composition.ts"

if (!(Test-Path $file)) {
  throw "Missing sprint-next-composition.ts"
}

$text = Get-Content $file -Raw

$requiredDeclarations = @(
  "const synthesisPackage",
  "const restraintAdjustedPackage"
)

$missing = @()

foreach ($decl in $requiredDeclarations) {
  if ($text -notlike "*$decl*") {
    $missing += "Missing declaration: $decl"
  }
}

$forbiddenUndefinedAliases = @(
  "restraintPackage"
)

foreach ($alias in $forbiddenUndefinedAliases) {
  if ($text -like "*$alias*") {
    $missing += "Forbidden stale alias remains: $alias"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Sprint Next composition variable reference guard failed"
}

Write-Host "SPRINT NEXT COMPOSITION VARIABLE REFERENCE GUARD PASSED"
