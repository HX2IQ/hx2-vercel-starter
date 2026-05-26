$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CHAT MASTER CONFIDENCE DIAGNOSTICS GUARD =="

$paths = @(
  "app/owner-console/page.tsx",
  "app/owner-console/_components/chat-master-panels.tsx"
)

$combined = ""

foreach ($path in $paths) {
  if (Test-Path $path) {
    $combined += "`n--- $path ---`n"
    $combined += Get-Content $path -Raw
  }
}

$required = @(
  "confidence_distribution",
  "High Confidence",
  "Medium Confidence",
  "Low Confidence",
  "Average Confidence",
  "Routing Maturity"
)

$missing = @()

foreach ($needle in $required) {
  if ($combined -notlike "*$needle*") {
    $missing += $needle
  }
}

if ($missing.Count -gt 0) {
  foreach ($item in $missing) {
    Write-Host "- UI missing: $item"
  }
  throw "Confidence diagnostics contract incomplete"
}

Write-Host "CHAT MASTER CONFIDENCE DIAGNOSTICS GUARD PASSED"
