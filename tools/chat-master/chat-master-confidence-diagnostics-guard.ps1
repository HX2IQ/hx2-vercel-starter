$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CHAT MASTER CONFIDENCE DIAGNOSTICS GUARD ==" -ForegroundColor Cyan

$api = ".\app\api\hx2\chat-master-diagnostics\route.ts"
$page = ".\app\owner-console\page.tsx"

if (!(Test-Path $api)) {
  throw "Missing chat master diagnostics API"
}

if (!(Test-Path $page)) {
  throw "Missing owner console page"
}

$apiText = Get-Content $api -Raw
$pageText = Get-Content $page -Raw

$requiredApi = @(
  "confidence_distribution",
  "high_confidence",
  "medium_confidence",
  "low_confidence",
  "confidence_estimate",
  "average_confidence"
)

$requiredUi = @(
  "confidence_distribution",
  "High Confidence",
  "Medium Confidence",
  "Low Confidence",
  "Average Confidence"
)

$missing = @()

foreach ($item in $requiredApi) {
  if ($apiText -notmatch [regex]::Escape($item)) {
    $missing += "API missing: $item"
  }
}

foreach ($item in $requiredUi) {
  if ($pageText -notmatch [regex]::Escape($item)) {
    $missing += "UI missing: $item"
  }
}

if ($missing.Count -gt 0) {

  Write-Host "CHAT MASTER CONFIDENCE DIAGNOSTICS GUARD FAILED" -ForegroundColor Red

  $missing | ForEach-Object {
    Write-Host "- $_" -ForegroundColor Yellow
  }

  throw "Confidence diagnostics contract incomplete"
}

Write-Host "CHAT MASTER CONFIDENCE DIAGNOSTICS GUARD PASSED" -ForegroundColor Green
