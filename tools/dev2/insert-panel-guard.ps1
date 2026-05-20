$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 POWERSHELL PANEL INSERTER GUARD =="

$file = "tools/dev2/insert-panel.ps1"

if (!(Test-Path $file)) {
  throw "Missing PowerShell panel inserter"
}

$text = Get-Content $file -Raw

$required = @(
  "TargetFile",
  "Anchor",
  "InsertFile",
  "Mode",
  "Anchor not found",
  "Panel insertion completed"
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

  throw "PowerShell panel inserter guard failed"
}

Write-Host "DEV2 POWERSHELL PANEL INSERTER GUARD PASSED"
