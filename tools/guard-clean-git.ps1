$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== Git cleanliness guard ==" -ForegroundColor Cyan

$status = git status --porcelain

if ($status) {
  Write-Host $status -ForegroundColor Yellow
  throw "Working tree is not clean. Commit or stash changes before safe deploy."
}

Write-Host "PASS: working tree clean." -ForegroundColor Green
