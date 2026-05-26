$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 CANONICAL PANEL INSERTER GUARD =="

$file = "tools/dev2/canonical-panel-inserter.ts"

if (!(Test-Path $file)) {
  throw "Missing canonical panel inserter"
}

$text = Get-Content $file -Raw

$required = @(
  "insertBeforeAnchor",
  "insertAfterAnchor",
  "ensureImport",
  "Anchor not found"
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

  throw "Canonical panel inserter guard failed"
}

Write-Host "DEV2 CANONICAL PANEL INSERTER GUARD PASSED"
