$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE DEPLOY MEMORY GITIGNORE GUARD =="

$GitIgnorePath = ".gitignore"

if (!(Test-Path $GitIgnorePath)) {
  throw "Missing .gitignore"
}

$GitIgnore = Get-Content $GitIgnorePath -Raw

if (-not $GitIgnore.Contains("tools/sprint-next/_audit/")) {
  throw ".gitignore missing tools/sprint-next/_audit/"
}

$Status = git status --short
$UnexpectedAudit = $Status | Select-String "tools/sprint-next/_audit"

if ($UnexpectedAudit) {
  throw "Audit files are appearing in git status. Check .gitignore."
}

Write-Host "PHASE 3B AUTOMODE DEPLOY MEMORY GITIGNORE GUARD PASSED"
