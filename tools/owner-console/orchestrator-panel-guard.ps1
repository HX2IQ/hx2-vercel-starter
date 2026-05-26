$ErrorActionPreference = "Stop"

$File = ".\app\owner-console\page.tsx"

if (!(Test-Path $File)) {
  throw "Missing owner console page"
}

$text = Get-Content $File -Raw

$required = @(
  "OrchestratorStatusPanel",
  "readiness_percent",
  "critical_readiness_percent",
  "optional_readiness_percent",
  "missing_critical",
  "missing_optional",
  "severity",
  "Critical Remediation",
  "Optional Remediation",
  "Critical Fixes",
  "Optional Fixes"
)

$missing = @()

foreach ($item in $required) {
  if ($text -notmatch [regex]::Escape($item)) {
    $missing += $item
  }
}

if ($missing.Count -gt 0) {
  Write-Host "OWNER CONSOLE ORCHESTRATOR PANEL GUARD FAILED" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "- Missing: $_" -ForegroundColor Yellow }
  throw "Owner console orchestrator panel contract incomplete"
}

Write-Host "OWNER CONSOLE ORCHESTRATOR PANEL GUARD PASSED" -ForegroundColor Green
