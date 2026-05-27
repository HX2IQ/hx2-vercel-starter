$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B CLEAN TREE GUARD =="

$Status = git status --short

$UnexpectedAudit = $Status | Select-String "tools/sprint-next/_audit"

if ($UnexpectedAudit) {
  throw "Audit files are appearing in git status. Check .gitignore for tools/sprint-next/_audit/"
}

Write-Host "PHASE 3B CLEAN TREE GUARD PASSED"
