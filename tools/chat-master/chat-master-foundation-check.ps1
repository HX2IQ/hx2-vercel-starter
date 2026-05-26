$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CHAT MASTER FOUNDATION CHECK ==" -ForegroundColor Cyan
Write-Host ""

$checks = @(
  "app/api/hx2/chat-master/route.ts",
  "app/api/hx2/router/route.ts",
  "app/api/hx2/execute/route.ts"
)

$missing = @()

foreach ($c in $checks) {

  if (Test-Path $c) {
    Write-Host "PASS  $c" -ForegroundColor Green
  }
  else {
    Write-Host "FAIL  $c" -ForegroundColor Red
    $missing += $c
  }
}

Write-Host ""

if ($missing.Count -eq 0) {
  Write-Host "CHAT MASTER FOUNDATION READY" -ForegroundColor Green
}
else {
  Write-Host "CHAT MASTER FOUNDATION INCOMPLETE" -ForegroundColor Yellow
}

Write-Host ""
