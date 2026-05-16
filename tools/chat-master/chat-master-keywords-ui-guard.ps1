$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CHAT MASTER KEYWORDS UI GUARD ==" -ForegroundColor Cyan

$api = ".\app\api\hx2\chat-master-keywords\route.ts"
$page = ".\app\owner-console\page.tsx"

if (!(Test-Path $api)) { throw "Missing chat master keywords API" }
if (!(Test-Path $page)) { throw "Missing owner console page" }

$apiText = Get-Content $api -Raw
$pageText = Get-Content $page -Raw

$requiredApi = @(
  "CHAT_MASTER_KEYWORDS",
  "keywords",
  "intents",
  "count"
)

$requiredUi = @(
  "getChatMasterKeywords",
  "ChatMasterKeywordsPanel",
  "Chat Master Keywords",
  "Centralized routing keyword contracts",
  "Keyword Groups"
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
  Write-Host "CHAT MASTER KEYWORDS UI GUARD FAILED" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
  throw "Chat master keywords API/UI contract incomplete"
}

Write-Host "CHAT MASTER KEYWORDS UI GUARD PASSED" -ForegroundColor Green
