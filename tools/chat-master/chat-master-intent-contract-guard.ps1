$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CHAT MASTER INTENT CONTRACT GUARD ==" -ForegroundColor Cyan

$file = ".\app\api\hx2\contracts\chat-master.ts"

if (!(Test-Path $file)) {
  throw "Missing Chat Master intent contract"
}

$text = Get-Content $file -Raw

$required = @(
  "ChatMasterIntent",
  "ChatMasterRouteDecision",
  "CHAT_MASTER_INTENTS",
  "general",
  "health",
  "markets",
  "legal",
  "parenting",
  "orchestrator",
  "developer",
  "target_node",
  "confidence"
)

$missing = @()

foreach ($item in $required) {
  if ($text -notmatch [regex]::Escape($item)) {
    $missing += $item
  }
}

if ($missing.Count -gt 0) {
  Write-Host "CHAT MASTER INTENT CONTRACT GUARD FAILED" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "- Missing: $_" -ForegroundColor Yellow }
  throw "Chat Master intent contract incomplete"
}

Write-Host "CHAT MASTER INTENT CONTRACT GUARD PASSED" -ForegroundColor Green
