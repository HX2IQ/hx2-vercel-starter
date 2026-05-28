$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B CACHE GITIGNORE GUARD =="

$GitIgnorePath = ".gitignore"

if (!(Test-Path $GitIgnorePath)) {
  throw "Missing .gitignore"
}

$GitIgnore = Get-Content $GitIgnorePath -Raw

if (-not $GitIgnore.Contains("tools/sprint-next/_cache/")) {
  throw ".gitignore missing tools/sprint-next/_cache/"
}

$Status = git status --short
$UnexpectedCache = $Status | Select-String "tools/sprint-next/_cache"

if ($UnexpectedCache) {
  throw "Cache files are appearing in git status. Check .gitignore."
}

Write-Host "PHASE 3B CACHE GITIGNORE GUARD PASSED"
