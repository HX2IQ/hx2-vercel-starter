$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CHAT MASTER ROUTER GUARD ==" -ForegroundColor Cyan

$router = ".\app\api\hx2\_lib\chat-master-router.ts"
$routeTest = ".\app\api\hx2\chat-master-route-test\route.ts"

if (!(Test-Path $router)) {
  throw "Missing chat master router helper"
}

if (!(Test-Path $routeTest)) {
  throw "Missing chat master route test API"
}

$routerText = Get-Content $router -Raw
$routeText = Get-Content $routeTest -Raw

$requiredRouter = @(
  "routeChatMasterIntent",
  "ChatMasterRouteDecision",
  "target_node",
  "confidence",
  "health",
  "markets",
  "legal",
  "parenting",
  "developer",
  "general"
)

$requiredRoute = @(
  "routeChatMasterIntent",
  "decision",
  "input",
  "NextResponse.json"
)

$missing = @()

foreach ($item in $requiredRouter) {
  if ($routerText -notmatch [regex]::Escape($item)) {
    $missing += "router missing: $item"
  }
}

foreach ($item in $requiredRoute) {
  if ($routeText -notmatch [regex]::Escape($item)) {
    $missing += "route-test missing: $item"
  }
}

if ($missing.Count -gt 0) {
  Write-Host "CHAT MASTER ROUTER GUARD FAILED" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
  throw "Chat master router contract incomplete"
}

Write-Host "CHAT MASTER ROUTER GUARD PASSED" -ForegroundColor Green
