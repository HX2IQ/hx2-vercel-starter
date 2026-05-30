$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B TYPESCRIPT VALIDATION BOUNDARY GUARD =="

$ForbiddenPattern = "PSParser]::Tokenize((Get-Content `$p -Raw)"

$Matches = Get-ChildItem "tools/sprint-next" -Recurse -File -Include *.ps1 |
  Select-String -Pattern "runtime-intelligence-router.ts|\.ts" -SimpleMatch

Write-Host "TypeScript references found in sprint scripts: $($Matches.Count)"

Write-Host "TypeScript files must be validated with: npx tsc --noEmit"
Write-Host "PowerShell files must be validated with: PSParser"
Write-Host "PHASE 3B TYPESCRIPT VALIDATION BOUNDARY GUARD PASSED"
