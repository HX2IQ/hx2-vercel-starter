$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CHAT MASTER EXECUTION MAP UI GUARD ==" -ForegroundColor Cyan

$api = ".\app\api\hx2\chat-master-execution-map\route.ts"
$page = ".\app\owner-console\page.tsx"

if (!(Test-Path $api)) { throw "Missing execution map API" }
if (!(Test-Path $page)) { throw "Missing owner console page" }

$apiText = Get-Content $api -Raw
$pageText = Get-Content $page -Raw

$requiredApi = @(
  "CHAT_MASTER_EXECUTION_MAP",
  "execution_map",
  "intents",
  "count"
)

$requiredUi = @(
  "getChatMasterExecutionMap",
  "ChatMasterExecutionMapPanel",
  "Chat Master Execution Map",
  "Current intent-to-node routing targets",
  "Routing Targets"
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
  Write-Host "CHAT MASTER EXECUTION MAP UI GUARD FAILED" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
  throw "Execution map API/UI contract incomplete"
}

Write-Host "CHAT MASTER EXECUTION MAP UI GUARD PASSED" -ForegroundColor Green
