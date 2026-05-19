$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CHAT MASTER DIAGNOSTICS UI GUARD =="

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
  "ChatMasterDiagnosticsPanel",
  "Chat Master Diagnostics",
  "Runtime routing visibility and keyword coverage",
  "Diagnostic Rows"
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
  throw "Chat master diagnostics API/UI contract incomplete"
}

Write-Host "CHAT MASTER DIAGNOSTICS UI GUARD PASSED"
