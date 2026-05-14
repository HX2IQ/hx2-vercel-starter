$ErrorActionPreference = "Stop"

$BootstrapFile = ".\tools\bootstrap\hx2-node-os-v1.txt"

if (!(Test-Path $BootstrapFile)) {
  throw "Missing bootstrap file."
}

$content = Get-Content $BootstrapFile -Raw

$checks = @(
  "HX2 NODE OS",
  "fix/ap2-enqueue-clean",
  "Current state:",
  "Core endpoints working:",
  "DEV2 tools now available:"
)

$failed = @()

foreach ($c in $checks) {
  if ($content -notmatch [regex]::Escape($c)) {
    $failed += $c
  }
}

if ($failed.Count -gt 0) {
  Write-Host ""
  Write-Host "BOOTSTRAP VALIDATION FAILED" -ForegroundColor Red
  $failed | ForEach-Object { Write-Host "Missing: $_" -ForegroundColor Yellow }
  exit 1
}

Write-Host ""
Write-Host "BOOTSTRAP VALIDATION PASSED" -ForegroundColor Green
