$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 SELF-CLEANING SMOKE TEST GUARD =="

$file = "tools/dev2/insert-panel-smoke.ps1"

if (!(Test-Path $file)) {
  throw "Missing insert-panel-smoke.ps1"
}

$text = Get-Content $file -Raw

$required = @(
  "Remove-Item $dir",
  "Temporary smoke fixtures cleaned"
)

$missing = @()

foreach ($needle in $required) {
  if ($text -notlike "*$needle*") {
    $missing += $needle
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- Missing: $m"
  }

  throw "DEV2 self-cleaning smoke test guard failed"
}

Write-Host "DEV2 SELF-CLEANING SMOKE TEST GUARD PASSED"
