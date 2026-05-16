$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CHAT MASTER RUNTIME SMOKE ==" -ForegroundColor Cyan

$route = ".\app\api\hx2\chat-master\route.ts"

if (!(Test-Path $route)) {
  throw "Missing runtime chat master API"
}

$text = Get-Content $route -Raw

$required = @(
  "POST",
  "routeChatMasterIntent",
  "decision",
  "routed",
  "NextResponse.json",
  "message",
  "input"
)

$missing = @()

foreach ($item in $required) {
  if ($text -notmatch [regex]::Escape($item)) {
    $missing += $item
  }
}

if ($missing.Count -gt 0) {
  Write-Host "CHAT MASTER RUNTIME SMOKE FAILED" -ForegroundColor Red
  $missing | ForEach-Object {
    Write-Host "- Missing: $_" -ForegroundColor Yellow
  }

  throw "Chat master runtime contract incomplete"
}

Write-Host "CHAT MASTER RUNTIME SMOKE PASSED" -ForegroundColor Green
