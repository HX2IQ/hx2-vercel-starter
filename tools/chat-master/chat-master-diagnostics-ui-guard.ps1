$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CHAT MASTER DIAGNOSTICS UI GUARD ==" -ForegroundColor Cyan

$api = ".\app\api\hx2\chat-master-diagnostics\route.ts"
$page = ".\app\owner-console\page.tsx"

if (!(Test-Path $api)) { throw "Missing chat master diagnostics API" }
if (!(Test-Path $page)) { throw "Missing owner console page" }

$apiText = Get-Content $api -Raw
$pageText = Get-Content $page -Raw

$requiredApi = @(
  "CHAT_MASTER_KEYWORDS",
  "CHAT_MASTER_EXECUTION_MAP",
  "diagnostics",
  "keyword_count",
  "execution_target",
  "intent_count"
)

$requiredUi = @(
  "getChatMasterDiagnostics",
  "ChatMasterDiagnosticsPanel",
  "Chat Master Diagnostics",
  "Runtime routing visibility and keyword coverage",
  "Execution Target",
  "Diagnostic Rows"
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
  Write-Host "CHAT MASTER DIAGNOSTICS UI GUARD FAILED" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
  throw "Chat master diagnostics API/UI contract incomplete"
}

Write-Host "CHAT MASTER DIAGNOSTICS UI GUARD PASSED" -ForegroundColor Green
