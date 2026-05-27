$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B LATEST AUDIT GUARD =="

$ViewerPath = "tools/sprint-next/phase3b-latest-audit.ps1"

if (!(Test-Path $ViewerPath)) {
  throw "Missing latest audit viewer: $ViewerPath"
}

$Viewer = Get-Content $ViewerPath -Raw

$RequiredTerms = @(
  "PHASE 3B LATEST AUDIT",
  "tools/sprint-next/_audit",
  "Sort-Object LastWriteTime -Descending",
  "ConvertFrom-Json",
  "ConvertTo-Json"
)

foreach ($Term in $RequiredTerms) {
  if ($Viewer -notmatch [regex]::Escape($Term)) {
    throw "Latest audit viewer missing required term: $Term"
  }
}

Write-Host "PHASE 3B LATEST AUDIT GUARD PASSED"
