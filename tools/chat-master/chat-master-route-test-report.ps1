$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 CHAT MASTER ROUTE TEST REPORT ==" -ForegroundColor Cyan
Write-Host ""

$router = ".\app\api\hx2\_lib\chat-master-router.ts"
$routeTest = ".\app\api\hx2\chat-master-route-test\route.ts"

if (!(Test-Path $router)) {
  throw "Missing router helper"
}

if (!(Test-Path $routeTest)) {
  throw "Missing route test API"
}

$routerText = Get-Content $router -Raw

$cases = @(
  @{ Query = "Is creatine safe daily?"; Expected = "health" },
  @{ Query = "Latest XRP market news"; Expected = "markets" },
  @{ Query = "How do I respond to a trademark office action?"; Expected = "legal" },
  @{ Query = "My child hates reading homework"; Expected = "parenting" },
  @{ Query = "Why did the Next.js build fail?"; Expected = "developer" },
  @{ Query = "What is the best plan today?"; Expected = "general" }
)

Write-Host "Static router contract present." -ForegroundColor Green
Write-Host ""
Write-Host "Route test cases to use after dev server starts:" -ForegroundColor Yellow

foreach ($case in $cases) {
  Write-Host ""
  Write-Host "Query:    $($case.Query)"
  Write-Host "Expected: $($case.Expected)"
  Write-Host "URL:      http://localhost:3000/api/hx2/chat-master-route-test?q=$([uri]::EscapeDataString($case.Query))"
}

Write-Host ""
Write-Host "CHAT MASTER ROUTE TEST REPORT READY" -ForegroundColor Green
