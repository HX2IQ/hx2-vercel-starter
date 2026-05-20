$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 TRANSIENT FILE CLEANUP =="

$scratch = "tools/dev2/scratch"

if (!(Test-Path $scratch)) {
  Write-Host "Scratch workspace missing. Nothing to clean."
  exit 0
}

$stale = Get-ChildItem $scratch -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object {
    $_.Extension -in @(".tsx", ".ts", ".js", ".jsx")
  }

if ($stale.Count -gt 0) {

  Write-Host ""
  Write-Host "Stale transient runtime files detected:"
  Write-Host ""

  foreach ($file in $stale) {
    Write-Host "- $($file.FullName)"
  }

  throw "DEV2 transient cleanup enforcement failed"
}

Write-Host "DEV2 TRANSIENT FILE CLEANUP PASSED"
