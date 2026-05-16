$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 CHAT MASTER READINESS REPORT ==" -ForegroundColor Cyan
Write-Host ""

$api = ".\app\api\hx2\chat-master-status\route.ts"

if (!(Test-Path $api)) {
  throw "Missing chat master status API"
}

$text = Get-Content $api -Raw

$fields = @(
  "readiness_percent",
  "healthy_checks",
  "total_checks",
  "chat_master_route",
  "router_route",
  "execute_route",
  "owner_console"
)

$missing = @()

foreach ($field in $fields) {
  if ($text -match [regex]::Escape($field)) {
    Write-Host "PASS  $field" -ForegroundColor Green
  } else {
    Write-Host "FAIL  $field" -ForegroundColor Red
    $missing += $field
  }
}

Write-Host ""

if ($missing.Count -eq 0) {
  Write-Host "CHAT MASTER READINESS: READY" -ForegroundColor Green
} else {
  Write-Host "CHAT MASTER READINESS: INCOMPLETE" -ForegroundColor Yellow
}

Write-Host ""

