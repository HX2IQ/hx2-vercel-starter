$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CHAT MASTER PANELS COMPONENT GUARD =="

$component = "app/owner-console/_components/chat-master-panels.tsx"

if (!(Test-Path $component)) {
  throw "Missing Chat Master panels component"
}

$text = Get-Content $component -Raw

$required = @(
  "export async function ChatMasterPanels",
  "getChatMasterStatus",
  "getChatMasterReadiness",
  "ChatMasterStatusPanel",
  "ChatMasterReadinessPanel",
  "ChatMasterIntentsPanel",
  "ChatMasterExecutionMapPanel",
  "ChatMasterKeywordsPanel",
  "ChatMasterDiagnosticsPanel",
  "Readiness Tier",
  "Route Coverage",
  "Diagnostics Coverage",
  "High Confidence",
  "Medium Confidence",
  "Low Confidence",
  "Average Confidence",
  "Routing Maturity",
  "Execution Target",
  "keyword_count"
)

$missing = @()

foreach ($needle in $required) {
  if ($text -notlike "*$needle*") {
    $missing += $needle
  }
}

if ($missing.Count -gt 0) {
  foreach ($item in $missing) {
    Write-Host "- Component missing: $item"
  }
  throw "Chat Master panels component guard failed"
}

Write-Host "CHAT MASTER PANELS COMPONENT GUARD PASSED"
