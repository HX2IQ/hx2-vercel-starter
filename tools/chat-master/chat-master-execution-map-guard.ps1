$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CHAT MASTER EXECUTION MAP GUARD ==" -ForegroundColor Cyan

$file = ".\app\api\hx2\contracts\chat-master-execution-map.ts"

if (!(Test-Path $file)) {
  throw "Missing chat master execution map"
}

$text = Get-Content $file -Raw

$required = @(
  "CHAT_MASTER_EXECUTION_MAP",
  "general",
  "health",
  "markets",
  "legal",
  "parenting",
  "orchestrator",
  "developer",
  "node",
  "description"
)

$missing = @()

foreach ($item in $required) {
  if ($text -notmatch [regex]::Escape($item)) {
    $missing += $item
  }
}

if ($missing.Count -gt 0) {
  Write-Host "CHAT MASTER EXECUTION MAP GUARD FAILED" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "- Missing: $_" -ForegroundColor Yellow }
  throw "Chat master execution map incomplete"
}

Write-Host "CHAT MASTER EXECUTION MAP GUARD PASSED" -ForegroundColor Green
