$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 SPRINT PACKAGE PREVIEW GUARD =="

$panel = "app/owner-console/_components/dev2-sprint-package-panel.tsx"
$sprintPanel = "app/owner-console/_components/sprint-next-panel.tsx"

foreach ($path in @($panel, $sprintPanel)) {
  if (!(Test-Path $path)) {
    throw "Missing required UI file: $path"
  }
}

$combined = (Get-Content $panel -Raw) + "`n" + (Get-Content $sprintPanel -Raw)

$required = @(
  "Dev2SprintPackagePanel",
  "DEV2 Sprint Package",
  "Files to Touch",
  "Execution Phases",
  "Copy-Ready PowerShell",
  "Commands",
  "Expected Guards",
  "Rollback",
  "dev2_sprint_package"
)

$missing = @()

foreach ($needle in $required) {
  if ($combined -notlike "*$needle*") {
    $missing += $needle
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- Missing: $m"
  }
  throw "DEV2 sprint package preview guard failed"
}

Write-Host "DEV2 SPRINT PACKAGE PREVIEW GUARD PASSED"


