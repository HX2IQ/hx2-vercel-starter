$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CHAT MASTER OWNER CONSOLE NORMALIZATION GUARD =="

$page = "app/owner-console/page.tsx"
$component = "app/owner-console/_components/chat-master-panels.tsx"

if (!(Test-Path $page)) {
  throw "Missing owner console page"
}

if (!(Test-Path $component)) {
  throw "Missing Chat Master component file"
}

$pageText = Get-Content $page -Raw
$componentText = Get-Content $component -Raw

$forbiddenInPage = @(
  "function ChatMasterStatusPanel",
  "function ChatMasterIntentsPanel",
  "function ChatMasterExecutionMapPanel",
  "function ChatMasterKeywordsPanel",
  "function ChatMasterDiagnosticsPanel",
  "function ChatMasterReadinessPanel",
  "async function getChatMasterStatus",
  "async function getChatMasterIntents",
  "async function getChatMasterExecutionMap",
  "async function getChatMasterKeywords",
  "async function getChatMasterDiagnostics",
  "async function getChatMasterReadiness",
  "chatMasterStatusData",
  "chatMasterIntentsData",
  "chatMasterExecutionMapData",
  "chatMasterKeywordsData",
  "chatMasterDiagnosticsData",
  "chatMasterReadinessData"
)

$violations = @()

foreach ($needle in $forbiddenInPage) {
  if ($pageText -like "*$needle*") {
    $violations += "Forbidden in page.tsx: $needle"
  }
}

$requiredInPage = @(
  'import { ChatMasterPanels } from "./_components/chat-master-panels";',
  "<ChatMasterPanels />"
)

foreach ($needle in $requiredInPage) {
  if ($pageText -notlike "*$needle*") {
    $violations += "Missing in page.tsx: $needle"
  }
}

$requiredInComponent = @(
  "export async function ChatMasterPanels",
  "ChatMasterStatusPanel",
  "ChatMasterReadinessPanel",
  "ChatMasterIntentsPanel",
  "ChatMasterExecutionMapPanel",
  "ChatMasterKeywordsPanel",
  "ChatMasterDiagnosticsPanel",
  "getChatMasterReadiness"
)

foreach ($needle in $requiredInComponent) {
  if ($componentText -notlike "*$needle*") {
    $violations += "Missing in component: $needle"
  }
}

if ($violations.Count -gt 0) {
  foreach ($v in $violations) {
    Write-Host "- $v"
  }
  throw "Chat Master owner console normalization guard failed"
}

Write-Host "CHAT MASTER OWNER CONSOLE NORMALIZATION GUARD PASSED"
