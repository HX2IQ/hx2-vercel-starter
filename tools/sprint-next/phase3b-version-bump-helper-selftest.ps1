$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B VERSION BUMP HELPER SELFTEST =="

$HelperPath = "tools/sprint-next/phase3b-bump-build-process-version.ps1"

if (!(Test-Path $HelperPath)) {
  throw "Missing version bump helper"
}

$errors = $null
[System.Management.Automation.PSParser]::Tokenize((Get-Content $HelperPath -Raw), [ref]$errors) | Out-Null
if ($errors) {
  throw ($errors | Out-String)
}

$Output = powershell -ExecutionPolicy Bypass -File $HelperPath `
  -NewVersion "3b.selftest" `
  -ReleaseNote "Selftest dry run only" `
  -DryRun 2>&1 | Out-String

if ($Output -notmatch "VERSION BUMP DRY RUN") {
  throw "Version bump helper dry run did not report VERSION BUMP DRY RUN"
}

if ($Output -notmatch "No files changed") {
  throw "Version bump helper dry run did not report No files changed"
}

Write-Host "PHASE 3B VERSION BUMP HELPER SELFTEST PASSED"
