$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CHAT MASTER STATUS GUARD ==" -ForegroundColor Cyan

$api = ".\app\api\hx2\chat-master-status\route.ts"
$page = ".\app\owner-console\page.tsx"

if (!(Test-Path $api)) {
  throw "Missing chat master status API"
}

if (!(Test-Path $page)) {
  throw "Missing owner console page"
}

$apiText = Get-Content $api -Raw
$pageText = Get-Content $page -Raw

$requiredApi = @(
  "readiness_percent",
  "healthy_checks",
  "total_checks",
  "chat_master_route",
  "router_route",
  "execute_route"
)

$requiredUi = @(
  "ChatMasterStatusPanel",
  "getChatMasterStatus",
  "Chat Master Status",
  "Unified HX2 routing foundation readiness"
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
  Write-Host "CHAT MASTER STATUS GUARD FAILED" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
  throw "Chat master status contract incomplete"
}

Write-Host "CHAT MASTER STATUS GUARD PASSED" -ForegroundColor Green
